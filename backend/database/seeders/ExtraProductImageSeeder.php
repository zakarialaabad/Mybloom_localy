<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ExtraProductImageSeeder extends Seeder
{
    public function run(): void
    {
        // Pool of Unsplash photo IDs (perfume / cosmetics theme)
        $pool = [
            '1594035910387-fea47794261f',
            '1608248543803-ba4f8c70ae0b',
            '1541643600914-78b084683702',
            '1587017539504-67cfbddac569',
            '1523293182086-7651a899d37f',
            '1547592166-23ac45744acd',
            '1585386959984-a4155224a1ad',
            '1563170351-be9070f0571e',
            '1556228578-8c89e6adf883',
            '1588776814546-ec7e878c5e4d',
            '1612817159949-195b0de69bb1',
            '1620925397942-c39b29a9a2de',
            '1609081620464-e2e8ecbed1af',
            '1583394838336-acd977736f90',
            '1596462502278-27bfac188191',
            '1598007264887-acc47d519b88',
            '1615397349754-cfa2066a298e',
            '1619451683416-2e48f8c4bc45',
            '1615529328331-f8917597711f',
            '1571781926291-c477ebfd024b',
        ];

        $rows = [];

        // Products 21–60 (40 products)
        for ($productId = 21; $productId <= 60; $productId++) {
            $photoId = $pool[($productId - 21) % count($pool)];
            $base    = "https://images.unsplash.com/photo-{$photoId}";

            // Primary image
            $rows[] = [
                'product_id' => $productId,
                'url'        => "{$base}?w=800",
                'alt'        => "Produit #{$productId}",
                'sort_order' => 0,
                'is_primary' => true,
                'created_at' => now(),
            ];

            // Extra gallery image for best-sellers (21–30)
            if ($productId <= 30) {
                $rows[] = [
                    'product_id' => $productId,
                    'url'        => "{$base}?w=800&fit=crop&crop=entropy",
                    'alt'        => "Produit #{$productId} — vue 2",
                    'sort_order' => 1,
                    'is_primary' => false,
                    'created_at' => now(),
                ];
            }
        }

        DB::table('product_images')->insert($rows);
    }
}
