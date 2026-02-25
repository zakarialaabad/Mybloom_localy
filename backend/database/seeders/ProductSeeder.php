<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $desc  = 'Une fragrance exclusivement conçue pour sublimer votre personnalité. Notes boisées, florales et orientales se marient avec élégance pour un sillage inoubliable.';
        $ingr  = 'Alcohol Denat., Aqua, Parfum (Fragrance), Benzyl Salicylate, Linalool, Limonene, Coumarin, Citronellol, Geraniol.';

        DB::table('products')->insert([
            // ── FEATURED (is_featured = true) ────────────────────────────────
            [
                'id' => 1,  'brand_id' => 1, 'category_id' => 5,
                'name' => 'Over Dose',       'slug' => 'over-dose',
                'subtitle' => 'Bold Body Mist',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 140.00, 'original_price' => 200.00,
                'stock' => 85, 'is_active' => true, 'is_featured' => true,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 2,  'brand_id' => 1, 'category_id' => 6,
                'name' => 'Sugar Pop',       'slug' => 'sugar-pop',
                'subtitle' => 'Silky Body Butter',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 120.00, 'original_price' => 160.00,
                'stock' => 60, 'is_active' => true, 'is_featured' => true,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 3,  'brand_id' => 1, 'category_id' => 4,
                'name' => 'Velvet Noir',     'slug' => 'velvet-noir',
                'subtitle' => 'Eau de Parfum Intense',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 280.00, 'original_price' => null,
                'stock' => 40, 'is_active' => true, 'is_featured' => true,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 4,  'brand_id' => 1, 'category_id' => 4,
                'name' => 'Atlas Rose',      'slug' => 'atlas-rose',
                'subtitle' => 'Eau de Parfum Floral',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 240.00, 'original_price' => 320.00,
                'stock' => 55, 'is_active' => true, 'is_featured' => true,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 5,  'brand_id' => 1, 'category_id' => 4,
                'name' => 'Bois du Sahara',  'slug' => 'bois-du-sahara',
                'subtitle' => 'Eau de Parfum Boisé',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'men', 'price' => 260.00, 'original_price' => null,
                'stock' => 35, 'is_active' => true, 'is_featured' => true,
                'created_at' => now(), 'updated_at' => now(),
            ],

            // ── STANDARD ACTIVE ──────────────────────────────────────────────
            [
                'id' => 6,  'brand_id' => 1, 'category_id' => 5,
                'name' => 'Cactus Flower',   'slug' => 'cactus-flower',
                'subtitle' => 'Fresh Body Mist',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 95.00, 'original_price' => 130.00,
                'stock' => 100, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 7,  'brand_id' => 1, 'category_id' => 4,
                'name' => 'Ambre Royal',     'slug' => 'ambre-royal',
                'subtitle' => 'Eau de Parfum Oriental',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 310.00, 'original_price' => null,
                'stock' => 30, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 8,  'brand_id' => 1, 'category_id' => 4,
                'name' => 'Jasmine Night',   'slug' => 'jasmine-night',
                'subtitle' => 'Eau de Parfum Floral',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 220.00, 'original_price' => 290.00,
                'stock' => 45, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 9,  'brand_id' => 1, 'category_id' => 5,
                'name' => 'Marine Breeze',   'slug' => 'marine-breeze',
                'subtitle' => 'Refreshing Body Mist',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'men', 'price' => 85.00, 'original_price' => 110.00,
                'stock' => 90, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 10, 'brand_id' => 1, 'category_id' => 6,
                'name' => 'Nude Rose',       'slug' => 'nude-rose',
                'subtitle' => 'Nourishing Body Butter',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 110.00, 'original_price' => null,
                'stock' => 70, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 11, 'brand_id' => 2, 'category_id' => 4,
                'name' => 'Chanel N°5',      'slug' => 'chanel-n5',
                'subtitle' => "L'Eau de Parfum",
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 350.00, 'original_price' => null,
                'stock' => 20, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 12, 'brand_id' => 3, 'category_id' => 4,
                'name' => 'Miss Dior',       'slug' => 'miss-dior',
                'subtitle' => 'Blooming Bouquet',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 330.00, 'original_price' => null,
                'stock' => 25, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 13, 'brand_id' => 4, 'category_id' => 4,
                'name' => 'La Vie Est Belle', 'slug' => 'la-vie-est-belle',
                'subtitle' => 'Eau de Parfum',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 295.00, 'original_price' => null,
                'stock' => 28, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 14, 'brand_id' => 5, 'category_id' => 4,
                'name' => 'Prada Paradoxe', 'slug' => 'prada-paradoxe',
                'subtitle' => 'Eau de Parfum',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 310.00, 'original_price' => null,
                'stock' => 22, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 15, 'brand_id' => 6, 'category_id' => 4,
                'name' => 'Libre',          'slug' => 'libre-ysl',
                'subtitle' => 'Eau de Parfum',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 320.00, 'original_price' => null,
                'stock' => 18, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 16, 'brand_id' => 7, 'category_id' => 4,
                'name' => 'Eros',           'slug' => 'versace-eros',
                'subtitle' => 'Eau de Toilette',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'men', 'price' => 240.00, 'original_price' => 290.00,
                'stock' => 32, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 17, 'brand_id' => 8, 'category_id' => 4,
                'name' => "L'Interdit",     'slug' => 'linterdit',
                'subtitle' => 'Eau de Parfum',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 275.00, 'original_price' => null,
                'stock' => 24, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 18, 'brand_id' => 1, 'category_id' => 6,
                'name' => 'Velvet Cream',   'slug' => 'velvet-cream',
                'subtitle' => 'Rich Body Butter',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 130.00, 'original_price' => null,
                'stock' => 50, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],

            // ── INACTIVE (is_active = false — invisible on storefront) ────────
            [
                'id' => 19, 'brand_id' => 1, 'category_id' => 4,
                'name' => 'Black Pearl',    'slug' => 'black-pearl',
                'subtitle' => 'Eau de Parfum Mysterieux',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 290.00, 'original_price' => 350.00,
                'stock' => 15, 'is_active' => false, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 20, 'brand_id' => 1, 'category_id' => 5,
                'name' => 'Gold Rush',      'slug' => 'gold-rush',
                'subtitle' => 'Sparkling Body Mist',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 100.00, 'original_price' => 140.00,
                'stock' => 75, 'is_active' => false, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
        ]);
    }
}
