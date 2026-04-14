<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CouponSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('coupons')->insert([
            [
                // Valid — 10% off, no minimum, unlimited, no expiry
                'id'               => 1,
                'code'             => 'BLOOM10',
                'company_name'     => 'Bloom Luxury',
                'promo_type'       => 'Influencers',
                'type'             => 'percent',
                'value'            => 10.00,
                'min_order_amount' => 0.00,
                'usage_limit'      => null,
                'used_count'       => 0,
                'expires_at'       => null,
                'is_active'        => true,
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                // Valid — 50 MAD fixed, requires ≥ 200 MAD cart
                'id'               => 2,
                'code'             => 'BIENVENUE50',
                'company_name'     => 'Welcome Collections',
                'promo_type'       => 'Top Client',
                'type'             => 'fixed',
                'value'            => 50.00,
                'min_order_amount' => 200.00,
                'usage_limit'      => 100,
                'used_count'       => 0,
                'expires_at'       => '2027-12-31 23:59:59',
                'is_active'        => true,
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                // Exhausted — used_count equals usage_limit → "coupon exhausted" error
                'id'               => 3,
                'code'             => 'FLASH20',
                'company_name'     => 'Flash Deals Inc.',
                'promo_type'       => 'Influencers',
                'type'             => 'percent',
                'value'            => 20.00,
                'min_order_amount' => 300.00,
                'usage_limit'      => 50,
                'used_count'       => 50,
                'expires_at'       => null,
                'is_active'        => true,
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
            [
                // Expired — expires_at is in the past → "coupon expired" error
                'id'               => 4,
                'code'             => 'ETE2024',
                'company_name'     => 'Summer Brands',
                'promo_type'       => 'Top Client',
                'type'             => 'percent',
                'value'            => 15.00,
                'min_order_amount' => 0.00,
                'usage_limit'      => null,
                'used_count'       => 0,
                'expires_at'       => '2024-08-01 23:59:59',
                'is_active'        => true,
                'created_at'       => now(),
                'updated_at'       => now(),
            ],
        ]);
    }
}
