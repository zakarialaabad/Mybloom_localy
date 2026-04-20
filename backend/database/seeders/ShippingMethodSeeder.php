<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ShippingMethodSeeder extends Seeder
{
    public function run(): void
    {
        $rows = [
            [
                'id'          => 1,
                'name'        => 'Laayoun',
                'description' => 'Livraison à Laayoun - 2-3 jours ouvrables',
                'price'       => 15.00,
                'free_over'   => 600.00,
                'is_active'   => true,
                'sort_order'  => 1,
            ],
            [
                'id'          => 2,
                'name'        => 'Autres Villes',
                'description' => 'Livraison dans les autres villes - 3-5 jours ouvrables',
                'price'       => 35.00,
                'free_over'   => 600.00,
                'is_active'   => true,
                'sort_order'  => 2,
            ],
        ];

        foreach ($rows as $row) {
            DB::table('shipping_methods')->updateOrInsert(
                ['id' => $row['id']],
                $row,
            );
        }
    }
}
