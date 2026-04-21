<?php

namespace App\Services;

use App\Models\Product;
use App\Models\ProductVariant;

class VariantService
{
    /**
     * Process and save variants for a product, determining the default.
     *
     * @param Product $product
     * @param array $variantsData Array of associative arrays, e.g. [['size' => 50, 'price' => 100], ...]
     * @return void
     */
    public function syncVariants(Product $product, array $variantsData): void
    {
        // 1. Delete existing variants
        $product->variants()->delete();

        if (empty($variantsData)) {
            return;
        }

        // 2. Sort variants ascending by size
        usort($variantsData, function ($a, $b) {
            return $a['size'] <=> $b['size'];
        });

        // 3. Determine default variant index based on rules:
        // IF 1 variant: default = that size (index 0)
        // IF 2 variants: default = largest size (index 1)
        // IF 3 variants: default = medium size (index 1)
        $count = count($variantsData);
        $defaultIndex = 0;

        if ($count == 2) {
            $defaultIndex = 1;
        } elseif ($count == 3) {
            $defaultIndex = 1; // Middle size after ascending sort
        }

        // 4. Save all variants (including promotion_percent)
        foreach ($variantsData as $index => $variantData) {
            // Accept 'promotion_percent' or legacy 'promotion' key from the frontend form
            $promoPercent = (float) ($variantData['promotion_percent'] ?? $variantData['promotion'] ?? 0);

            $product->variants()->create([
                'size'              => $variantData['size'],
                'unit'              => $variantData['unit'] ?? 'ml',
                'price'             => $variantData['price'],
                'promotion_percent' => $promoPercent,
                'stock_quantity'    => (int) ($variantData['stock'] ?? $variantData['stock_quantity'] ?? 0),
                'is_default'        => ($index === $defaultIndex),
            ]);
        }

        // 5. Update products.price and products.original_price from the default variant
        //    Backend is the single source of truth for pricing.
        $product->load('variants');
        $defaultVariant = $product->variants->firstWhere('is_default', true)
            ?? $product->variants->first();

        if ($defaultVariant) {
            $basePrice    = (float) $defaultVariant->price;
            $promoPercent = (float) $defaultVariant->promotion_percent;
            $stock        = (int) $defaultVariant->stock_quantity;

            if ($promoPercent > 0) {
                $finalPrice = round($basePrice * (1 - $promoPercent / 100), 2);
                $product->update([
                    'price'          => $finalPrice,
                    'original_price' => $basePrice,
                    'stock'          => $stock,
                ]);
            } else {
                $product->update([
                    'price'          => $basePrice,
                    'original_price' => null,
                    'stock'          => $stock,
                ]);
            }
        }
    }
}
