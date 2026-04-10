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
        $types = [
            [
                'name' => 'Body Butter',
                'slug' => 'body_butter',
            ],
            [
                'name' => 'Body Scrub',
                'slug' => 'body_scrub',
            ],
            [
                'name' => 'Tint Visage',
                'slug' => 'tint_visage',
            ],
            [
                'name' => 'Hair Mist',
                'slug' => 'hair_mist',
            ],
            [
                'name' => 'Body Mist',
                'slug' => 'body_mist',
            ],
            [
                'name' => 'Déodorant',
                'slug' => 'deodorant',
            ],
            [
                'name' => 'Crème Parfumée',
                'slug' => 'creme_parfumee',
            ],
            [
                'name' => 'Diffuseur',
                'slug' => 'diffuseur',
            ],
            [
                'name' => 'Spray d\'Intérieur',
                'slug' => 'spray_dinterieur',
            ],
            [
                'name' => 'Coffret Cadeau',
                'slug' => 'coffret_cadeau',
            ],
            [
                'name' => 'Huile Parfumée',
                'slug' => 'huile_parfumee',
            ],
            [
                'name' => 'Floral Musqué',
                'slug' => 'floral_musque',
            ],
            [
                'name' => 'Oriental Boisé',
                'slug' => 'oriental_boise',
            ],
            [
                'name' => 'Gourmand Floral',
                'slug' => 'gourmand_floral',
            ],
            [
                'name' => 'Oriental Floral',
                'slug' => 'oriental_floral',
            ],
            [
                'name' => 'Floral Chypré',
                'slug' => 'floral_chypre',
            ],
            [
                'name' => 'Oriental Gourmand',
                'slug' => 'oriental_gourmand',
            ],
            [
                'name' => 'Fruité Floral',
                'slug' => 'fruite_floral',
            ],
            [
                'name' => 'Floral Épicé',
                'slug' => 'floral_epice',
            ],
            [
                'name' => 'Fruité Gourmand',
                'slug' => 'fruite_gourmand',
            ],
            [
                'name' => 'Oriental Floral Aquatique',
                'slug' => 'oriental_floral_aquatique',
            ],
            [
                'name' => 'Floral Boisé',
                'slug' => 'floral_boise',
            ],
            [
                'name' => 'Floral Fruité',
                'slug' => 'floral_fruite',
            ],
            [
                'name' => 'Chypré Fruité',
                'slug' => 'chypre_fruite',
            ],
            [
                'name' => 'Aromatique Fougère',
                'slug' => 'aromatique_fougere',
            ],
            [
                'name' => 'Oriental',
                'slug' => 'oriental',
            ],
            [
                'name' => 'Floral Oriental Gourmand',
                'slug' => 'floral_oriental_gourmand',
            ],
            [
                'name' => 'Gourmand Fruité',
                'slug' => 'gourmand_fruite',
            ],
            [
                'name' => 'Fruité Aquatique',
                'slug' => 'fruite_aquatique',
            ],
            [
                'name' => 'Oriental Ambré',
                'slug' => 'oriental_ambre',
            ],
            [
                'name' => 'Floral Aldéhydé',
                'slug' => 'floral_aldehyde',
            ],
            [
                'name' => 'Floral Blanc',
                'slug' => 'floral_blanc',
            ],
            [
                'name' => 'Fruité Chypré',
                'slug' => 'fruite_chypre',
            ],
            [
                'name' => 'Chypré Fruité Gourmand',
                'slug' => 'chypre_fruite_gourmand',
            ],
            [
                'name' => 'Floral Gourmand',
                'slug' => 'floral_gourmand',
            ],
            [
                'name' => 'Floral',
                'slug' => 'floral',
            ],
            [
                'name' => 'Ambré Floral',
                'slug' => 'ambre_floral',
            ],
            [
                'name' => 'Oriental Chypré',
                'slug' => 'oriental_chypre',
            ],
            [
                'name' => 'Floral Boisé Musqué',
                'slug' => 'floral_boise_musque',
            ],
            [
                'name' => 'Aromatique Fruité',
                'slug' => 'aromatique_fruite',
            ],
            [
                'name' => 'Floral Fougère',
                'slug' => 'floral_fougere',
            ],
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
