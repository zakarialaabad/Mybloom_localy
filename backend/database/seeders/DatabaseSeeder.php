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
            ProductSeeder::class,            // 4 — products (needs brand + category)
            ProductImageSeeder::class,       // 5 — product_images (needs products)
            ProductSizeSeeder::class,        // 6 — product_sizes (needs products)
            ShippingMethodSeeder::class,     // 7 — shipping_methods
            CouponSeeder::class,             // 8 — coupons
            OrderSeeder::class,              // 9 — orders (needs shipping_methods + coupons)
            OrderItemSeeder::class,          // 10 — order_items (needs orders + products)
            OrderStatusHistorySeeder::class, // 11 — order_status_histories (needs orders)
            ReviewSeeder::class,             // 12 — reviews (needs products + orders)
            ReviewImageSeeder::class,        // 13 — review_images (needs reviews)
        ]);
    }
}
