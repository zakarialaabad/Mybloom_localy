<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product;

/**
 * Mark 10 existing products as recommended (is_recommended = true)
 * 
 * These products will appear in the "You may also Like" carousel
 * on product detail pages
 */
class RecommendedProductSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Marking 10 products as recommended...');

        // Get 10 active products (mix of featured and regular)
        $products = Product::where('is_active', true)
            ->inRandomOrder()
            ->limit(10)
            ->get();

        if ($products->count() === 0) {
            $this->command->warn('⚠️ No active products found to mark as recommended!');
            return;
        }

        // Mark them as recommended
        foreach ($products as $product) {
            $product->update(['is_recommended' => true]);
            $this->command->info("✅ Marked as recommended: {$product->name} (ID: {$product->id})");
        }

        $count = $products->count();
        $this->command->info("✅ Successfully marked {$count} products as recommended!");
    }
}
