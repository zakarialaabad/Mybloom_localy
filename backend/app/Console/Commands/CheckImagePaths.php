<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class CheckImagePaths extends Command
{
    protected $signature = 'image:check';
    protected $description = 'Check current image paths in database';

    public function handle(): int
    {
        $images = DB::table('product_images')
            ->select('url')
            ->distinct()
            ->limit(10)
            ->get();

        $this->info('Current product image paths:');
        foreach ($images as $img) {
            $this->line("  • " . $img->url);
        }

        $this->info("\nChecking for /storage/images/ paths:");
        $oldCount = DB::table('product_images')
            ->where('url', 'LIKE', '%/storage/images/%')
            ->count();
        
        $this->line("  Found: " . $oldCount . " old format paths");

        return 0;
    }
}
