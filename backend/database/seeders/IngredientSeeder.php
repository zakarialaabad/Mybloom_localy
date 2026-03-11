<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Product;

class IngredientSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Define master ingredient library ───────────────────────────────
        $library = [
            // Floral
            ['name' => 'Rose',          'image_url' => 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Jasmin',        'image_url' => 'https://images.unsplash.com/photo-1596438459194-f275f413d6ff?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Lavande',       'image_url' => 'https://images.unsplash.com/photo-1499084732479-de2c02d45fcc?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Fleur d\'Oranger', 'image_url' => 'https://images.unsplash.com/photo-1587830433670-fbf37f9c8951?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Ylang-Ylang',   'image_url' => 'https://images.unsplash.com/photo-1585435557343-3b348031e799?auto=format&fit=crop&w=400&q=80'],
            // Woody / Oriental
            ['name' => 'Oud',           'image_url' => 'https://images.unsplash.com/photo-1547887538-047f814d0d0e?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Santal',        'image_url' => 'https://images.unsplash.com/photo-1542315192-1f61a1792f33?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Patchouli',     'image_url' => 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Cèdre',         'image_url' => 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Vétiver',       'image_url' => 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=400&q=80'],
            // Citrus / Fresh
            ['name' => 'Bergamote',     'image_url' => 'https://images.unsplash.com/photo-1587830433670-fbf37f9c8951?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Citron',        'image_url' => 'https://images.unsplash.com/photo-1590502593747-42a996133562?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Néroli',        'image_url' => 'https://images.unsplash.com/photo-1598453930827-32c8c3fb7a4d?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Pamplemousse',  'image_url' => 'https://images.unsplash.com/photo-1546636889-ba9fdd63583e?auto=format&fit=crop&w=400&q=80'],
            // Sweet / Gourmand
            ['name' => 'Vanille',       'image_url' => 'https://images.unsplash.com/photo-1611068661871-5c3e69b00a89?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Ambre',         'image_url' => 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Musc',          'image_url' => 'https://images.unsplash.com/photo-1598452963314-b09f397a5c48?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Fève Tonka',    'image_url' => 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&w=400&q=80'],
            // Cosmetic / Body care
            ['name' => 'Beurre de Karité', 'image_url' => 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Huile d\'Argan', 'image_url' => 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Huile d\'Amande Douce', 'image_url' => 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Vitamine E',    'image_url' => 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Aloe Vera',     'image_url' => 'https://images.unsplash.com/photo-1509773896068-7fd415d406e4?auto=format&fit=crop&w=400&q=80'],
            ['name' => 'Beurre de Cacao', 'image_url' => 'https://images.unsplash.com/photo-1607631568010-a87245c0daf8?auto=format&fit=crop&w=400&q=80'],
        ];

        DB::table('ingredients')->insert(
            array_map(fn ($i) => array_merge($i, [
                'created_at' => now(),
                'updated_at' => now(),
            ]), $library)
        );

        // ── 2. Build a name→id map ────────────────────────────────────────────
        $ids = DB::table('ingredients')->pluck('id', 'name');

        // ── 3. Define 3-ingredient sets, keyed by semantic group ─────────────
        // Groups chosen based on product gender & category (EDP, Body Mist, Body Butter…)
        $groups = [
            // EDP / EDT — women (floral + musk + wood)
            'edp_women'   => [$ids['Rose'],       $ids['Jasmin'],         $ids['Musc']],
            // EDP / EDT — men (wood + citrus + amber)
            'edp_men'     => [$ids['Santal'],      $ids['Bergamote'],      $ids['Ambre']],
            // EDP / EDT — unisex (oud + wood + musk)
            'edp_unisex'  => [$ids['Oud'],         $ids['Cèdre'],          $ids['Musc']],
            // Body Mist — women (floral + citrus + neroli)
            'mist_women'  => [$ids['Fleur d\'Oranger'], $ids['Citron'],    $ids['Néroli']],
            // Body Mist — men (citrus + vetyver + bergamot)
            'mist_men'    => [$ids['Bergamote'],   $ids['Vétiver'],        $ids['Citron']],
            // Body Butter / Lotion (shea + almond + vit E)
            'body_butter' => [$ids['Beurre de Karité'], $ids['Huile d\'Amande Douce'], $ids['Vitamine E']],
            // Gourmand / Oriental (vanilla + amber + tonka)
            'gourmand'    => [$ids['Vanille'],     $ids['Ambre'],          $ids['Fève Tonka']],
            // Fresh / Aquatic (neroli + lavender + bergamot)
            'fresh'       => [$ids['Néroli'],      $ids['Lavande'],        $ids['Pamplemousse']],
            // Default fallback
            'default'     => [$ids['Rose'],        $ids['Vanille'],        $ids['Musc']],
        ];

        // ── 4. Category IDs for body-mist / body-butter (from CategorySeeder) ─
        // CategorySeeder creates: 5=Body Mist, 6=Body Butter/Lotion — adjust if yours differ.
        // We detect by category name as a safety net.
        $bodyMistCatIds = DB::table('categories')
            ->where('name', 'like', '%mist%')
            ->orWhere('name', 'like', '%spray%')
            ->orWhere('name', 'like', '%brume%')
            ->pluck('id')->toArray();

        $bodyButterCatIds = DB::table('categories')
            ->where('name', 'like', '%butter%')
            ->orWhere('name', 'like', '%lotion%')
            ->orWhere('name', 'like', '%beurre%')
            ->pluck('id')->toArray();

        // ── 5. Assign 3 ingredients to every product ─────────────────────────
        $pivot = [];
        $products = Product::all(['id', 'gender', 'category_id', 'name']);

        foreach ($products as $product) {
            $cat    = $product->category_id;
            $gender = $product->gender;

            if (in_array($cat, $bodyButterCatIds)) {
                $set = $groups['body_butter'];
            } elseif (in_array($cat, $bodyMistCatIds)) {
                $set = $gender === 'men' ? $groups['mist_men'] : $groups['mist_women'];
            } elseif ($gender === 'men') {
                $set = $groups['edp_men'];
            } elseif ($gender === 'women') {
                $set = $groups['edp_women'];
            } elseif ($gender === 'unisex') {
                $set = $groups['edp_unisex'];
            } else {
                $set = $groups['default'];
            }

            foreach ($set as $ingredientId) {
                $pivot[] = [
                    'product_id'    => $product->id,
                    'ingredient_id' => $ingredientId,
                ];
            }
        }

        // Insert in chunks to avoid hitting SQL parameter limits
        foreach (array_chunk($pivot, 500) as $chunk) {
            DB::table('ingredient_product')->insertOrIgnore($chunk);
        }

        $this->command->info('✅  IngredientSeeder: ' . count($library) . ' ingredients, ' . count($pivot) . ' pivot rows inserted.');
    }
}
