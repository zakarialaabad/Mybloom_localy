<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductTypeSeederFrench extends Seeder
{
    /**
     * Seed the product_types table with the exact types from the current database.
     */
    public function run(): void
    {
        $types = [
            ['name' => 'Body Butter',       'slug' => 'body_butter'],
            ['name' => 'Body Scrub',        'slug' => 'body_scrub'],
            ['name' => 'Tint Visage',       'slug' => 'tint_visage'],
            ['name' => 'Hair Mist',         'slug' => 'hair_mist'],
            ['name' => 'Body Mist',         'slug' => 'body_mist'],
            ['name' => 'Déodorant',         'slug' => 'deodorant'],
            ['name' => 'مخمرية',            'slug' => 'makhmaria'],
            ['name' => 'Diffuseur',         'slug' => 'diffuseur'],
            ['name' => "Spray d'Intérieur", 'slug' => 'spray_dinterieur'],
            ['name' => 'Coffrets',          'slug' => 'coffrets'],
            ['name' => 'Huile Parfumée',    'slug' => 'huile_parfumee'],
            ['name' => 'Eau de Parfum',     'slug' => 'eau_de_parfum'],
            ['name' => 'Musc',              'slug' => 'musc'],
        ];

        foreach ($types as $type) {
            $existing = DB::table('product_types')
                ->where('slug', $type['slug'])
                ->first();

            if (!$existing) {
                DB::table('product_types')->insert([
                    'name'       => $type['name'],
                    'slug'       => $type['slug'],
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('✅ Product Types seeded: ' . count($types));
    }
}
