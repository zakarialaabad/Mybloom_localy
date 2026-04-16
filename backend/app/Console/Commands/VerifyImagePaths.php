<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class VerifyImagePaths extends Command
{
    protected $signature = 'image:verify-paths';
    protected $description = 'Verify image paths were migrated correctly';

    public function handle(): int
    {
        $this->info('Checking image paths migration...\n');

        $tables = [
            'product_images' => 'url',
            'review_images' => 'url',
            'banners' => 'image_url',
            'ingredients' => 'image_url',
        ];

        foreach ($tables as $table => $column) {
            if (!DB::connection()->getSchemaBuilder()->hasTable($table)) {
                continue;
            }

            $oldFormat = DB::table($table)
                ->where($column, 'LIKE', '/storage/images/%')
                ->count();

            $newFormat = DB::table($table)
                ->where(function ($query) use ($column) {
                    $query->where($column, 'LIKE', 'products/%')
                        ->orWhere($column, 'LIKE', 'reviews/%')
                        ->orWhere($column, 'LIKE', 'banners/%')
                        ->orWhere($column, 'LIKE', 'ingredients/%');
                })
                ->count();

            $total = DB::table($table)->count();

            $this->line("$table:$column");
            $this->line("  Old format (/storage/images/): $oldFormat");
            $this->line("  New format (products/,etc): $newFormat");
            $this->line("  Total records: $total\n");
        }

        // Show sample paths
        $this->info('Sample migrated paths:');
        $samples = DB::table('product_images')
            ->where('url', 'LIKE', 'products/%')
            ->limit(5)
            ->pluck('url');

        foreach ($samples as $path) {
            $this->line("  ✓ $path");
        }

        $this->info('\n✅ Migration verification complete!');
        return 0;
    }
}
