<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,              // 1 — admins
            BrandSeeder::class,              // 2 — brands
            CategorySeeder::class,           // 3 — categories (parent before child)
            ExtraCategorySeeder::class,      // 4 — 6 extra categories
            ProductTypeSeeder::class,        // 5 — product types (Visage, Corps, Parfums, Skincare, Hair)
            ProductSeeder::class,            // 6 — products (needs brand + category)
            ExtraProductSeeder::class,       // 6 — 40 extra products (10 featured + 30 regular)
            LowStockProductSeeder::class,    // 7 — 30 low-stock / out-of-stock products (IDs 61–90)
            ProductImageSeeder::class,       // 7 — product_images (needs products)
            ExtraProductImageSeeder::class,  // 8 — images for products 21–60
            ProductSizeSeeder::class,        // 9 — product_sizes (needs products)
            ShippingMethodSeeder::class,     // 7 — shipping_methods
            CouponSeeder::class,             // 8 — coupons
            OrderSeeder::class,              // 9 — orders (needs shipping_methods + coupons)
            OrderItemSeeder::class,          // 10 — order_items (needs orders + products)
            OrderStatusHistorySeeder::class, // 11 — order_status_histories (needs orders)
            ReviewSeeder::class,             // 12 — reviews (needs products + orders)
            ReviewImageSeeder::class,        // 13 — review_images (needs reviews)
            IngredientSeeder::class,         // 14 — ingredients + pivot (needs products)
            ProductFaqSeeder::class,         // 15 — 3 FAQs linked to every product
        ]);
    }
}
