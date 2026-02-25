<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductImageSeeder extends Seeder
{
    public function run(): void
    {
        // Unsplash perfume/cosmetics photo IDs
        $photos = [
            1  => '1594035910387-fea47794261f',
            2  => '1608248543803-ba4f8c70ae0b',
            3  => '1541643600914-78b084683702',
            4  => '1587017539504-67cfbddac569',
            5  => '1523293182086-7651a899d37f',
            6  => '1547592166-23ac45744acd',
            7  => '1585386959984-a4155224a1ad',
            8  => '1590156562745-5f23e8b8e3da',
            9  => '1563170351-be9070f0571e',
            10 => '1571781926291-c477ebfd024b',
            11 => '1595425970377-c9703cf48b6d',
            12 => '1453396450673-3fe83d2db2c4',
            13 => '1584305574647-0f89641e2a4a',
            14 => '1542736632-4d2e7f2a1a0b',
            15 => '1510290206584-d32fbebf6e51',
            16 => '1556228578-8c89e6adf883',
            17 => '1570194065650-d99fb4d5c3b2',
            18 => '1547621641-4e4c53c0b4f0',
            19 => '1464305953044-5b594e9fc21d',
            20 => '1567721913486-6585f069b172',
        ];

        $rows = [];

        foreach ($photos as $productId => $photoId) {
            $base = "https://images.unsplash.com/photo-{$photoId}";

            // Primary image (every product)
            $rows[] = [
                'product_id' => $productId,
                'url'        => "{$base}?w=800",
                'alt'        => "Produit Bloom #{$productId}",
                'sort_order' => 0,
                'is_primary' => true,
                'created_at' => now(),
            ];

            // Extra gallery images for featured products (1–5) and all active products
            if ($productId <= 5) {
                $rows[] = [
                    'product_id' => $productId,
                    'url'        => "{$base}?w=800&fit=crop&crop=entropy",
                    'alt'        => "Produit Bloom #{$productId} — vue 2",
                    'sort_order' => 1,
                    'is_primary' => false,
                    'created_at' => now(),
                ];
                $rows[] = [
                    'product_id' => $productId,
                    'url'        => "{$base}?w=800&fit=crop&crop=faces",
                    'alt'        => "Produit Bloom #{$productId} — vue 3",
                    'sort_order' => 2,
                    'is_primary' => false,
                    'created_at' => now(),
                ];
            } elseif ($productId <= 18) {
                $rows[] = [
                    'product_id' => $productId,
                    'url'        => "{$base}?w=800&fit=crop&crop=entropy",
                    'alt'        => "Produit Bloom #{$productId} — vue 2",
                    'sort_order' => 1,
                    'is_primary' => false,
                    'created_at' => now(),
                ];
            }
        }

        DB::table('product_images')->insert($rows);
    }
}
