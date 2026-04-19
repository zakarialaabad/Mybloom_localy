<?php

namespace App\Console\Commands;

use App\Services\ImageService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class OptimizeExistingImages extends Command
{
    protected $signature = 'images:optimize
        {--dry-run : Show what would be done without making changes}
        {--type= : Only process a specific type (products, reviews, banners, ingredients, brand_logos)}
        {--force : Re-process images that are already in WebP format}';

    protected $description = 'Optimize all existing images in the database: re-process through ImageService (resize, compress, convert to WebP)';

    private ImageService $imageService;
    private int $processed = 0;
    private int $skipped = 0;
    private int $failed = 0;
    private int $totalSavedBytes = 0;

    public function handle(): int
    {
        $this->imageService = app(ImageService::class);
        $dryRun = $this->option('dry-run');
        $type = $this->option('type');
        $force = $this->option('force');

        $this->info('=== Image Optimization Command ===');
        if ($dryRun) {
            $this->warn('DRY RUN MODE — no changes will be made');
        }
        $this->newLine();

        $tasks = [
            'products'     => fn() => $this->optimizeProductImages($dryRun, $force),
            'reviews'      => fn() => $this->optimizeReviewImages($dryRun, $force),
            'banners'      => fn() => $this->optimizeBannerImages($dryRun, $force),
            'ingredients'  => fn() => $this->optimizeIngredientImages($dryRun, $force),
            'brand_logos'  => fn() => $this->optimizeBrandLogos($dryRun, $force),
        ];

        if ($type && isset($tasks[$type])) {
            $tasks[$type]();
        } elseif ($type) {
            $this->error("Unknown type: {$type}. Valid: " . implode(', ', array_keys($tasks)));
            return 1;
        } else {
            foreach ($tasks as $task) {
                $task();
            }
        }

        $this->newLine();
        $this->info('=== Summary ===');
        $this->table(
            ['Metric', 'Count'],
            [
                ['Processed', $this->processed],
                ['Skipped', $this->skipped],
                ['Failed', $this->failed],
                ['Space Saved', $this->formatBytes($this->totalSavedBytes)],
            ]
        );

        return 0;
    }

    private function optimizeProductImages(bool $dryRun, bool $force): void
    {
        $this->info('── Product Images ──');
        $images = DB::table('product_images')->get();
        $bar = $this->output->createProgressBar($images->count());

        foreach ($images as $image) {
            $this->processImageRow(
                table: 'product_images',
                id: $image->id,
                urlColumn: 'url',
                currentPath: $image->url,
                type: 'products',
                dryRun: $dryRun,
                force: $force,
            );
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
    }

    private function optimizeReviewImages(bool $dryRun, bool $force): void
    {
        $this->info('── Review Images ──');
        $images = DB::table('review_images')->get();
        $bar = $this->output->createProgressBar($images->count());

        foreach ($images as $image) {
            $this->processImageRow(
                table: 'review_images',
                id: $image->id,
                urlColumn: 'url',
                currentPath: $image->url,
                type: 'reviews',
                dryRun: $dryRun,
                force: $force,
            );
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
    }

    private function optimizeBannerImages(bool $dryRun, bool $force): void
    {
        $this->info('── Banners ──');
        $banners = DB::table('banners')->get();
        $bar = $this->output->createProgressBar($banners->count());

        foreach ($banners as $banner) {
            $this->processImageRow(
                table: 'banners',
                id: $banner->id,
                urlColumn: 'image_path',
                currentPath: $banner->image_path,
                type: 'banners',
                dryRun: $dryRun,
                force: $force,
            );
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
    }

    private function optimizeIngredientImages(bool $dryRun, bool $force): void
    {
        $this->info('── Ingredients ──');
        $ingredients = DB::table('ingredients')->whereNotNull('image_url')->where('image_url', '!=', '')->get();
        $bar = $this->output->createProgressBar($ingredients->count());

        foreach ($ingredients as $ingredient) {
            $this->processImageRow(
                table: 'ingredients',
                id: $ingredient->id,
                urlColumn: 'image_url',
                currentPath: $ingredient->image_url,
                type: 'ingredients',
                dryRun: $dryRun,
                force: $force,
            );
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
    }

    private function optimizeBrandLogos(bool $dryRun, bool $force): void
    {
        $this->info('── Brand Logos ──');
        $brands = DB::table('brands')->whereNotNull('logo_url')->where('logo_url', '!=', '')->get();
        $bar = $this->output->createProgressBar($brands->count());

        foreach ($brands as $brand) {
            $this->processImageRow(
                table: 'brands',
                id: $brand->id,
                urlColumn: 'logo_url',
                currentPath: $brand->logo_url,
                type: 'brand_logos',
                dryRun: $dryRun,
                force: $force,
            );
            $bar->advance();
        }

        $bar->finish();
        $this->newLine(2);
    }

    private function processImageRow(
        string $table,
        int $id,
        string $urlColumn,
        ?string $currentPath,
        string $type,
        bool $dryRun,
        bool $force,
    ): void {
        if (!$currentPath) {
            $this->skipped++;
            return;
        }

        // Skip SVGs (can't be processed by Intervention Image)
        if (str_ends_with(strtolower($currentPath), '.svg')) {
            $this->skipped++;
            return;
        }

        // Already an optimized storage path with .webp extension — skip unless forced
        if (!$force && str_ends_with(strtolower($currentPath), '.webp') && !str_starts_with($currentPath, '/') && !str_starts_with($currentPath, 'http')) {
            $this->skipped++;
            return;
        }

        // Locate the source file
        $sourcePath = $this->resolveSourcePath($currentPath);
        if (!$sourcePath) {
            $this->warn(" [SKIP] Cannot locate source file for: {$currentPath}");
            $this->skipped++;
            return;
        }

        if ($dryRun) {
            $originalSize = filesize($sourcePath);
            $this->line("  Would process: {$currentPath} ({$this->formatBytes($originalSize)})");
            $this->processed++;
            return;
        }

        try {
            $originalSize = filesize($sourcePath);
            $result = $this->imageService->process($sourcePath, $type);

            // Update DB row with new path
            DB::table($table)->where('id', $id)->update([
                $urlColumn => $result->relativePath,
            ]);

            // Delete old file from storage if it was a storage path
            if (!str_starts_with($currentPath, '/') && !str_starts_with($currentPath, 'http')) {
                $disk = Storage::disk('public');
                if ($currentPath !== $result->relativePath && $disk->exists($currentPath)) {
                    $disk->delete($currentPath);
                }
            }

            $savedBytes = $originalSize - $result->filesize;
            $this->totalSavedBytes += max(0, $savedBytes);
            $this->processed++;

            Log::info('Image optimized', [
                'table' => $table,
                'id' => $id,
                'old_path' => $currentPath,
                'new_path' => $result->relativePath,
                'original_size' => $this->formatBytes($originalSize),
                'new_size' => $result->getHumanReadableSize(),
                'saved' => $this->formatBytes(max(0, $savedBytes)),
                'converted' => $result->converted,
            ]);
        } catch (\Exception $e) {
            $this->error(" [FAIL] {$currentPath}: {$e->getMessage()}");
            Log::error('Image optimization failed', [
                'table' => $table,
                'id' => $id,
                'path' => $currentPath,
                'error' => $e->getMessage(),
            ]);
            $this->failed++;
        }
    }

    /**
     * Resolve a stored path to an actual file path on disk.
     */
    private function resolveSourcePath(string $path): ?string
    {
        // Full URL — try to download
        if (filter_var($path, FILTER_VALIDATE_URL)) {
            return $this->downloadToTemp($path);
        }

        // Storage-relative path (e.g. "products/abc.webp") — look in storage
        if (!str_starts_with($path, '/')) {
            $storagePath = Storage::disk('public')->path($path);
            if (file_exists($storagePath)) {
                return $storagePath;
            }
        }

        // Frontend public paths (e.g. /images/..., /Brand/..., /comments/...)
        $frontendPublicDir = base_path('../frontend/Public');
        $candidate = $frontendPublicDir . str_replace('/', DIRECTORY_SEPARATOR, $path);
        if (file_exists($candidate)) {
            return $candidate;
        }

        // Backend public path (e.g. /public_Image/...)
        $backendPublicDir = public_path();
        $candidate = $backendPublicDir . str_replace('/', DIRECTORY_SEPARATOR, $path);
        if (file_exists($candidate)) {
            return $candidate;
        }

        return null;
    }

    /**
     * Download a URL to a temp file and return the path.
     */
    private function downloadToTemp(string $url): ?string
    {
        try {
            $context = stream_context_create([
                'http' => ['timeout' => 30, 'user_agent' => 'Laravel/ImageOptimizer'],
                'ssl' => ['verify_peer' => false, 'verify_peer_name' => false],
            ]);
            $data = @file_get_contents($url, false, $context);
            if ($data === false) {
                return null;
            }

            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $extensionMap = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/webp' => 'webp',
                'image/gif' => 'gif',
            ];
            $tempFile = tempnam(sys_get_temp_dir(), 'imgopt_');
            file_put_contents($tempFile, $data);

            $mimeType = $finfo->file($tempFile);
            $ext = $extensionMap[$mimeType] ?? 'jpg';
            $newPath = $tempFile . '.' . $ext;
            rename($tempFile, $newPath);

            return $newPath;
        } catch (\Exception $e) {
            return null;
        }
    }

    private function formatBytes(int $bytes): string
    {
        if ($bytes <= 0) return '0 B';
        $units = ['B', 'KB', 'MB', 'GB'];
        $pow = floor(log($bytes) / log(1024));
        $pow = min($pow, count($units) - 1);
        return round($bytes / (1 << (10 * $pow)), 2) . ' ' . $units[$pow];
    }
}
