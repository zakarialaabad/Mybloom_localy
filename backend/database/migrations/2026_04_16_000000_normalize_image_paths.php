<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migration - normalize image paths by removing /storage/ prefix
     * 
     * This migration consolidates inconsistent path storing formats:
     *  - Old format: '/storage/products/image.jpg'
     *  - New format: 'products/image.jpg'
     * 
     * The new ImageService stores only relative paths (format 2) for consistency.
     * This migration allows old images to coexist while normalizing their paths.
     * 
     * The ImageUrlResolver utility handles both formats seamlessly during API responses.
     */
    public function up(): void
    {
        // Tables and columns that store image paths
        $imageColumns = [
            'product_images' => ['url'],
            'review_images' => ['url'],
            'admins' => ['profile_image'],
            'banners' => ['image_url'],
            'ingredients' => ['image_url'],
            'categories' => ['image_url'],
            'brands' => ['image_url'],
        ];

        foreach ($imageColumns as $table => $columns) {
            // Skip if table doesn't exist
            if (!Schema::hasTable($table)) {
                continue;
            }

            foreach ($columns as $column) {
                // Skip if column doesn't exist
                if (!Schema::hasColumn($table, $column)) {
                    continue;
                }

                // Normalize: remove '/storage/' prefix from all URLs in this column
                DB::table($table)
                    ->where($column, 'LIKE', '/storage/%')
                    ->update([
                        $column => DB::raw("SUBSTRING($column, 10)") // Remove first 9 characters (/storage/)
                    ]);
            }
        }
    }

    /**
     * Reverse the migration - restore /storage/ prefix
     * 
     * Note: This is provided for development/testing purposes.
     * In production, you may want to comment this out to prevent accidental rollback.
     */
    public function down(): void
    {
        // Tables and columns that store image paths
        $imageColumns = [
            'product_images' => ['url'],
            'review_images' => ['url'],
            'admins' => ['profile_image'],
            'banners' => ['image_url'],
            'ingredients' => ['image_url'],
            'categories' => ['image_url'],
            'brands' => ['image_url'],
        ];

        foreach ($imageColumns as $table => $columns) {
            // Skip if table doesn't exist
            if (!Schema::hasTable($table)) {
                continue;
            }

            foreach ($columns as $column) {
                // Skip if column doesn't exist
                if (!Schema::hasColumn($table, $column)) {
                    continue;
                }

                // Reverse normalization: add '/storage/' prefix back to relative paths
                // Only add prefix if it doesn't already start with http/https or have /storage/
                DB::table($table)
                    ->where($column, 'NOT LIKE', 'http%')
                    ->where($column, 'NOT LIKE', '/storage/%')
                    ->whereNotNull($column)
                    ->update([
                        $column => DB::raw("CONCAT('/storage/', $column)")
                    ]);

            }
        }
    }
};
