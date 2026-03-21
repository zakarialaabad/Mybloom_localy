<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Recalculate products.price and products.original_price for all products
 * that have size variants with a promotion_percent.
 *
 * Before this fix, the controller was storing the raw base price in products.price.
 * The correct behaviour is:
 *   products.price          = final selling price  = base * (1 - promo / 100)
 *   products.original_price = base price (shown crossed-out in the UI) when promo > 0
 */
return new class extends Migration
{
    public function up(): void
    {
        // Load every product that has at least one size variant
        $products = DB::table('products')
            ->whereNull('deleted_at')
            ->pluck('id');

        foreach ($products as $productId) {
            // Use the first size variant (lowest id) as the canonical price source
            $firstSize = DB::table('product_sizes')
                ->where('product_id', $productId)
                ->orderBy('id')
                ->first();

            if (!$firstSize) {
                continue; // No variant — leave the product price untouched
            }

            $basePrice    = (float) $firstSize->price_modifier;
            $promoPercent = (float) ($firstSize->promotion_percent ?? 0);

            if ($promoPercent <= 0) {
                // No promotion: final price = base price, original_price = null
                DB::table('products')->where('id', $productId)->update([
                    'price'          => $basePrice,
                    'original_price' => null,
                ]);
            } else {
                $finalPrice = round($basePrice * (1 - $promoPercent / 100), 2);
                DB::table('products')->where('id', $productId)->update([
                    'price'          => $finalPrice,
                    'original_price' => $basePrice,
                ]);
            }
        }
    }

    public function down(): void
    {
        // Reverse: restore products.price back to the base price (price_modifier of first size)
        $products = DB::table('products')
            ->whereNull('deleted_at')
            ->pluck('id');

        foreach ($products as $productId) {
            $firstSize = DB::table('product_sizes')
                ->where('product_id', $productId)
                ->orderBy('id')
                ->first();

            if (!$firstSize) {
                continue;
            }

            DB::table('products')->where('id', $productId)->update([
                'price'          => (float) $firstSize->price_modifier,
                'original_price' => null,
            ]);
        }
    }
};
