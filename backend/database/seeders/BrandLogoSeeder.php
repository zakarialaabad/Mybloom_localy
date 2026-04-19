<?php

namespace Database\Seeders;

use App\Services\ImageService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BrandLogoSeeder extends Seeder
{
    public function run(): void
    {
        $brandDir = base_path('../frontend/Public/Brand');

        if (!is_dir($brandDir)) {
            $this->command->warn("Brand folder not found: {$brandDir}");
            return;
        }

        $imageService = app(ImageService::class);
        $allowedExts = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'];
        $files = array_diff(scandir($brandDir), ['.', '..']);

        $inserted = 0;
        $updated = 0;

        foreach ($files as $file) {
            $ext = strtolower(pathinfo($file, PATHINFO_EXTENSION));
            if (!in_array($ext, $allowedExts, true)) {
                continue;
            }

            $name = trim(pathinfo($file, PATHINFO_FILENAME));
            if ($name === '') {
                continue;
            }

            $slug = Str::slug($name);
            $filePath = $brandDir . DIRECTORY_SEPARATOR . $file;

            // SVGs can't be processed by Intervention Image — store directly
            if ($ext === 'svg') {
                $logoUrl = '/Brand/' . $file;
            } else {
                try {
                    $result = $imageService->process($filePath, 'brand_logos');
                    $logoUrl = $result->relativePath;
                } catch (\Exception $e) {
                    Log::warning("BrandLogoSeeder: Failed to process {$file}: {$e->getMessage()}");
                    $logoUrl = '/Brand/' . $file;
                }
            }

            $existing = DB::table('brands')->where('slug', $slug)->first();
            if ($existing) {
                if ($existing->logo_url === null || $existing->logo_url === '') {
                    DB::table('brands')->where('id', $existing->id)->update([
                        'logo_url' => $logoUrl,
                        'updated_at' => now(),
                    ]);
                    $updated++;
                }
                continue;
            }

            DB::table('brands')->insert([
                'name' => $name,
                'slug' => $slug,
                'logo_url' => $logoUrl,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $inserted++;
        }

        $this->command->info("BrandLogoSeeder done. Inserted: {$inserted}, Updated: {$updated}");
    }
}
