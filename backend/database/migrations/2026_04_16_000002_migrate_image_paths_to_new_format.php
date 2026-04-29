<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Migrate broken /storage/images/... paths to new products/ format
     * 
     * Converts:
     *   /storage/images/ProductName/filename.jpg → products/filename (normalized)
     *   /storage/images/... → products/image-hash (generates unique name)
     * 
     * This handles seeded data that has broken image paths
     */
    public function up(): void
    {
        $this->migrateImagePaths();
    }

    public function down(): void
    {
    }

    private function migrateImagePaths(): void
    {
        // Tables with image URL columns
        $imageColumns = [
            'product_images' => 'url',
            'review_images' => 'url',
            'banners' => 'image_url',
            'ingredients' => 'image_url',
            'categories' => 'image_url',
            'brands' => 'image_url',
            'admins' => 'profile_image',
        ];

        foreach ($imageColumns as $table => $column) {
            if (!Schema::hasTable($table)) {
                continue;
            }

            if (!Schema::hasColumn($table, $column)) {
                continue;
            }

            // Get all records with /storage/images/ or /storage//images/ paths (double or single slash)
            $records = DB::table($table)
                ->where(function ($query) use ($column) {
                    $query->where($column, 'LIKE', '/storage/images/%')
                          ->orWhere($column, 'LIKE', '/storage//images/%');
                })
                ->get();

            foreach ($records as $record) {
                $oldPath = $record->{$column};
                $newPath = $this->convertPath($oldPath, $table);

                if ($newPath !== $oldPath) {
                    DB::table($table)
                        ->where('id', $record->id)
                        ->update([$column => $newPath]);

                }
            }
        }
    }

    private function convertPath(string $oldPath, string $table): string
    {
        // Already in new format
        if (str_starts_with($oldPath, 'products/') || 
            str_starts_with($oldPath, 'reviews/') ||
            str_starts_with($oldPath, 'review-images/') ||
            str_starts_with($oldPath, 'banners/') ||
            str_starts_with($oldPath, 'ingredients/') ||
            str_starts_with($oldPath, 'admin_profiles/')) {
            return $oldPath;
        }

        // Skip external URLs
        if (str_starts_with($oldPath, 'http://') || str_starts_with($oldPath, 'https://')) {
            return $oldPath;
        }

        // Parse the old path - handle both /storage/images/ and /storage//images/
        // Format: /storage/images/ProductName/filename.jpg OR /storage//images/ProductName/filename.jpg
        preg_match('/\/storage\/?\/images\/(.+?)\/(.+)$/', $oldPath, $matches);

        if (!isset($matches[2])) {
            // Fallback: generate new path from hash
            $hash = Str::random(32);
            $folder = $this->getFolderForTable($table);
            return "$folder/$hash.jpg";
        }

        $filename = $matches[2];
        $folder = $this->getFolderForTable($table);

        // Return new format: folder/normalized-filename
        return "$folder/" . $this->normalizeFilename($filename);
    }

    private function getFolderForTable(string $table): string
    {
        return match($table) {
            'product_images' => 'products',
            'review_images', 'reviews' => 'review-images',
            'banners' => 'banners',
            'ingredients' => 'ingredients',
            'categories' => 'products',
            'brands' => 'products',
            'admins' => 'admin_profiles',
            default => 'products',
        };
    }

    private function normalizeFilename(string $filename): string
    {
        // Keep the extension
        $extension = pathinfo($filename, PATHINFO_EXTENSION);
        
        // URL decode filename (convert %20 to space, etc.)
        $decoded = urldecode($filename);
        
        // Remove the extension for processing
        $name = pathinfo($decoded, PATHINFO_BASENAME);
        if ($extension) {
            $name = substr($name, 0, -strlen($extension) - 1);
        }

        // Slugify: lowercase, replace spaces/special chars with hyphen
        $slug = Str::slug($name);

        // Return with extension
        return $slug . ($extension ? ".$extension" : '');
    }
};
