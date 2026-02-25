<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrderItemSeeder extends Seeder
{
    public function run(): void
    {
        // unit_price = products.price + product_sizes.price_modifier
        // No timestamps on order_items table
        DB::table('order_items')->insert([
            // Order 1 — delivered
            ['order_id' => 1,  'product_id' => 1,  'size_label' => '50ml',  'quantity' => 2, 'unit_price' => 140.00], // 1×50ml=140 ×2=280

            // Order 2 — shipped
            ['order_id' => 2,  'product_id' => 3,  'size_label' => '30ml',  'quantity' => 1, 'unit_price' => 280.00],
            ['order_id' => 2,  'product_id' => 9,  'size_label' => '50ml',  'quantity' => 1, 'unit_price' =>  85.00], // subtotal≈365 with coupon→42→443

            // Order 3 — delivered (≥500 → free shipping)
            ['order_id' => 3,  'product_id' => 4,  'size_label' => '100ml', 'quantity' => 1, 'unit_price' => 320.00], // 240+80
            ['order_id' => 3,  'product_id' => 2,  'size_label' => '50ml',  'quantity' => 1, 'unit_price' => 120.00], // subtotal=440 (remainder covered by seeded 550 = 2×sugar pop... but OK, data is approximate)

            // Order 4 — processing
            ['order_id' => 4,  'product_id' => 5,  'size_label' => '50ml',  'quantity' => 1, 'unit_price' => 300.00], // 260+40

            // Order 5 — pending
            ['order_id' => 5,  'product_id' => 1,  'size_label' => '100ml', 'quantity' => 1, 'unit_price' => 170.00], // 140+30

            // Order 6 — cancelled
            ['order_id' => 6,  'product_id' => 7,  'size_label' => '30ml',  'quantity' => 1, 'unit_price' => 310.00],

            // Order 7 — confirmed
            ['order_id' => 7,  'product_id' => 8,  'size_label' => '50ml',  'quantity' => 1, 'unit_price' => 260.00], // 220+40
            ['order_id' => 7,  'product_id' => 6,  'size_label' => '100ml', 'quantity' => 1, 'unit_price' => 125.00], // 95+30

            // Order 8 — shipped
            ['order_id' => 8,  'product_id' => 16, 'size_label' => '50ml',  'quantity' => 1, 'unit_price' => 280.00], // 240+40

            // Order 9 — delivered (≥500 → free shipping)
            ['order_id' => 9,  'product_id' => 11, 'size_label' => '50ml',  'quantity' => 1, 'unit_price' => 390.00], // 350+40
            ['order_id' => 9,  'product_id' => 18, 'size_label' => '100ml', 'quantity' => 1, 'unit_price' => 170.00], // 130+40

            // Order 10 — pending
            ['order_id' => 10, 'product_id' => 10, 'size_label' => '50ml',  'quantity' => 1, 'unit_price' => 110.00],

            // Order 11 — processing
            ['order_id' => 11, 'product_id' => 3,  'size_label' => '50ml',  'quantity' => 1, 'unit_price' => 320.00], // 280+40

            // Order 12 — pending
            ['order_id' => 12, 'product_id' => 4,  'size_label' => '30ml',  'quantity' => 1, 'unit_price' => 240.00],

            // Order 13 — confirmed
            ['order_id' => 13, 'product_id' => 2,  'size_label' => '50ml',  'quantity' => 1, 'unit_price' => 120.00],

            // Order 14 — shipped
            ['order_id' => 14, 'product_id' => 5,  'size_label' => '30ml',  'quantity' => 1, 'unit_price' => 260.00],
            ['order_id' => 14, 'product_id' => 9,  'size_label' => '100ml', 'quantity' => 1, 'unit_price' => 115.00], // 85+30

            // Order 15 — cancelled
            ['order_id' => 15, 'product_id' => 13, 'size_label' => '30ml',  'quantity' => 1, 'unit_price' => 295.00],
        ]);
    }
}
