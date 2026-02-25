<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('shipping_methods')->insert([
            [
                'id'          => 1,
                'name'        => 'Livraison Standard',
                'description' => 'Livraison en 3-5 jours ouvrables partout au Maroc.',
                'price'       => 35.00,
                'free_over'   => null,
                'is_active'   => true,
                'sort_order'  => 1,
            ],
            [
                'id'          => 2,
                'name'        => 'Livraison Express',
                'description' => 'Livraison en 24-48h dans les grandes villes.',
                'price'       => 65.00,
                'free_over'   => null,
                'is_active'   => true,
                'sort_order'  => 2,
            ],
            [
                'id'          => 3,
                'name'        => 'Livraison Gratuite',
                'description' => 'Gratuit pour toute commande supérieure ou égale à 500 MAD.',
                'price'       => 0.00,
                'free_over'   => 500.00,
                'is_active'   => true,
                'sort_order'  => 3,
            ],
        ]);
    }
}
