<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            AdminSeeder::class,              // 1 — admins
            ShippingMethodSeeder::class,     // 2 — shipping_methods
            CouponSeeder::class,             // 3 — coupons
            ProductJsonSeeder::class,        // 4 — products + images + brands + categories (real data from products.json)
            IngredientImageSeeder::class,    // 5 — populate ingredient image_urls from INGRÉDIENTS folder
            BannerSeeder::class,             // 6 — banners (after categories exist)
            ProductSizeSeeder::class,        // 6 — product_sizes (needs products)
            OrderSeeder::class,              // 7 — orders (needs shipping_methods + coupons)
            OrderItemSeeder::class,          // 8 — order_items (needs orders + products)
            OrderStatusHistorySeeder::class, // 9 — order_status_histories (needs orders)
            ReviewSeeder::class,             // 10 — reviews (needs products + orders)
            ReviewImageSeeder::class,        // 11 — review_images (needs reviews)
            CommentReviewSeeder::class,      // 12 — homepage comments from frontend/Public/comments
            ProductFaqSeeder::class,         // 13 — 3 FAQs linked to every product
            RecommendedProductSeeder::class, // 14 — 10 recommended products for carousel
        ]);
    }
}
