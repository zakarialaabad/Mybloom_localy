<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductTypeSeederFrench extends Seeder
{
    /**
     * Seed the product_types table with exact French types
     */
    public function run(): void
    {
        // Keep only core product types and a single standardized fragrance type: "Eau de Parfum"
        $types = [
            ['name' => 'Body Butter', 'slug' => 'body_butter'],
            ['name' => 'Body Scrub', 'slug' => 'body_scrub'],
            ['name' => 'Tint Visage', 'slug' => 'tint_visage'],
            ['name' => 'Hair Mist', 'slug' => 'hair_mist'],
            ['name' => 'Body Mist', 'slug' => 'body_mist'],
            ['name' => 'Déodorant', 'slug' => 'deodorant'],
            ['name' => 'Crème Parfumée', 'slug' => 'creme_parfumee'],
            ['name' => 'Diffuseur', 'slug' => 'diffuseur'],
            ['name' => "Spray d'Intérieur", 'slug' => 'spray_dinterieur'],
            ['name' => 'Coffret Cadeau', 'slug' => 'coffret_cadeau'],
            ['name' => 'Huile Parfumée', 'slug' => 'huile_parfumee'],
            ['name' => 'Eau de Parfum', 'slug' => 'eau_de_parfum'],
        ];

        foreach ($types as $type) {
            // Check if product type already exists
            $existing = DB::table('product_types')
                ->where('slug', $type['slug'])
                ->first();

            if (!$existing) {
                DB::table('product_types')->insert([
                    'name' => $type['name'],
                    'slug' => $type['slug'],
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('✅ Product Types seeded: ' . count($types));
    }
}
