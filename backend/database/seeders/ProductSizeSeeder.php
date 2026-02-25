<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductSizeSeeder extends Seeder
{
    public function run(): void
    {
        // category_id 4 = Eau de Parfum  → sizes: 30ml / 50ml / 100ml
        // category_id 5 = Body Mist      → sizes: 50ml / 100ml / 200ml
        // category_id 6 = Body Butter    → sizes: 50ml / 100ml / 200ml

        DB::table('product_sizes')->insert([

            // ── Product 1 — Over Dose (Body Mist, cat 5) ─────────────────────
            ['product_id' => 1, 'label' => '50ml',  'price_modifier' => 0.00,  'stock' => 50],
            ['product_id' => 1, 'label' => '100ml', 'price_modifier' => 30.00, 'stock' => 35],
            ['product_id' => 1, 'label' => '200ml', 'price_modifier' => 60.00, 'stock' => 10],

            // ── Product 2 — Sugar Pop (Body Butter, cat 6) ───────────────────
            ['product_id' => 2, 'label' => '50ml',  'price_modifier' => 0.00,  'stock' => 40],
            ['product_id' => 2, 'label' => '100ml', 'price_modifier' => 40.00, 'stock' => 20],
            ['product_id' => 2, 'label' => '200ml', 'price_modifier' => 70.00, 'stock' => 10],

            // ── Product 3 — Velvet Noir (EDP, cat 4) ─────────────────────────
            ['product_id' => 3, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 20],
            ['product_id' => 3, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 15],
            ['product_id' => 3, 'label' => '100ml', 'price_modifier' => 80.00, 'stock' => 5],

            // ── Product 4 — Atlas Rose (EDP, cat 4) ──────────────────────────
            ['product_id' => 4, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 30],
            ['product_id' => 4, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 20],
            ['product_id' => 4, 'label' => '100ml', 'price_modifier' => 80.00, 'stock' => 5],

            // ── Product 5 — Bois du Sahara (EDP, cat 4) ──────────────────────
            ['product_id' => 5, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 20],
            ['product_id' => 5, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 10],
            ['product_id' => 5, 'label' => '100ml', 'price_modifier' => 80.00, 'stock' => 5],

            // ── Product 6 — Cactus Flower (Body Mist) ────────────────────────
            ['product_id' => 6, 'label' => '50ml',  'price_modifier' => 0.00,  'stock' => 60],
            ['product_id' => 6, 'label' => '100ml', 'price_modifier' => 30.00, 'stock' => 40],

            // ── Product 7 — Ambre Royal (EDP) ────────────────────────────────
            ['product_id' => 7, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 20],
            ['product_id' => 7, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 10],

            // ── Product 8 — Jasmine Night (EDP) ──────────────────────────────
            ['product_id' => 8, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 25],
            ['product_id' => 8, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 20],

            // ── Product 9 — Marine Breeze (Body Mist) ────────────────────────
            ['product_id' => 9, 'label' => '50ml',  'price_modifier' => 0.00,  'stock' => 55],
            ['product_id' => 9, 'label' => '100ml', 'price_modifier' => 30.00, 'stock' => 35],

            // ── Product 10 — Nude Rose (Body Butter) ─────────────────────────
            ['product_id' => 10, 'label' => '50ml',  'price_modifier' => 0.00,  'stock' => 45],
            ['product_id' => 10, 'label' => '100ml', 'price_modifier' => 40.00, 'stock' => 25],

            // ── Product 11 — Chanel N°5 ───────────────────────────────────────
            ['product_id' => 11, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 12],
            ['product_id' => 11, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 8],

            // ── Product 12 — Miss Dior ────────────────────────────────────────
            ['product_id' => 12, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 15],
            ['product_id' => 12, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 10],

            // ── Product 13 — La Vie Est Belle ─────────────────────────────────
            ['product_id' => 13, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 16],
            ['product_id' => 13, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 12],

            // ── Product 14 — Prada Paradoxe ───────────────────────────────────
            ['product_id' => 14, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 12],
            ['product_id' => 14, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 10],

            // ── Product 15 — Libre YSL ────────────────────────────────────────
            ['product_id' => 15, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 10],
            ['product_id' => 15, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 8],

            // ── Product 16 — Eros Versace ─────────────────────────────────────
            ['product_id' => 16, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 18],
            ['product_id' => 16, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 14],

            // ── Product 17 — L'Interdit ───────────────────────────────────────
            ['product_id' => 17, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 14],
            ['product_id' => 17, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 10],

            // ── Product 18 — Velvet Cream (Body Butter) ──────────────────────
            ['product_id' => 18, 'label' => '50ml',  'price_modifier' => 0.00,  'stock' => 30],
            ['product_id' => 18, 'label' => '100ml', 'price_modifier' => 40.00, 'stock' => 20],

            // ── Product 19 — Black Pearl (inactive) ───────────────────────────
            ['product_id' => 19, 'label' => '30ml',  'price_modifier' => 0.00,  'stock' => 8],
            ['product_id' => 19, 'label' => '50ml',  'price_modifier' => 40.00, 'stock' => 7],

            // ── Product 20 — Gold Rush (inactive) ─────────────────────────────
            ['product_id' => 20, 'label' => '50ml',  'price_modifier' => 0.00,  'stock' => 40],
            ['product_id' => 20, 'label' => '100ml', 'price_modifier' => 30.00, 'stock' => 35],
        ]);
    }
}
