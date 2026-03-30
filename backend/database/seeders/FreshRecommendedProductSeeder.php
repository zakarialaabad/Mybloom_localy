<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

/**
 * Recommended Products Seeder (Fresh Setup)
 * 
 * Marks the first 10 products as recommended.
 * This is useful for creating a clean set of recommendations,
 * and can be run multiple times to reset recommendations.
 * 
 * Usage:
 *   php artisan db:seed --class=FreshRecommendedProductSeeder
 */
class FreshRecommendedProductSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Resetting and marking 10 fresh recommended products...');
        $this->command->newLine();

        // First, clear all existing recommendations
        Product::where('is_recommended', true)->update(['is_recommended' => false]);
        $this->command->info('✓ Cleared all existing recommendations');

        // Get first 10 active products
        $products = Product::where('is_active', true)
            ->orderBy('id')
            ->limit(10)
            ->get();

        if ($products->count() === 0) {
            $this->command->error('✗ No active products found!');
            return;
        }

        // Mark them as recommended
        $this->command->newLine();
        foreach ($products as $product) {
            $product->update(['is_recommended' => true]);
            $this->command->line("✅ <info>{$product->name}</info> (ID: {$product->id}) — {$product->price} DH");
        }

        $count = $products->count();
        $this->command->newLine();
        $this->command->info("╔═══════════════════════════════════════════════════════════════╗");
        $this->command->info("║   ✅ Successfully marked {$count} products as recommended!          ║");
        $this->command->info("╚═══════════════════════════════════════════════════════════════╝");
        $this->command->newLine();
        $this->command->line("These products will now appear in the <fg=cyan>\"You may also Like\"</> carousel.");
        $this->command->line("Verify by running: <fg=green>php artisan recommendations:count</>");
    }
}
