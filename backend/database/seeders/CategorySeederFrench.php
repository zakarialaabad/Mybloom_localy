<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategorySeederFrench extends Seeder
{
    /**
     * Seed the categories table with exact French categories
     */
    public function run(): void
    {
        $categories = [
            [
                'name' => 'Beurre Corporel',
                'slug' => 'beurre-corporel',
                'description' => 'Beurres corporels et crèmes riches',
            ],
            [
                'name' => 'Parfum',
                'slug' => 'parfum',
                'description' => 'Parfums, brumes et fragrances',
            ],
            [
                'name' => 'Gommage',
                'slug' => 'gommage',
                'description' => 'Gommages et exfoliants',
            ],
            [
                'name' => 'Maquillage',
                'slug' => 'maquillage',
                'description' => 'Produits de maquillage naturels',
            ],
            [
                'name' => 'Hygiene corporelle',
                'slug' => 'hygiene-corporelle',
                'description' => 'Savons et produits d\'hygiène',
            ],
        ];

        foreach ($categories as $category) {
            // Check if category already exists
            $existing = DB::table('categories')
                ->where('slug', $category['slug'])
                ->where('parent_id', null)
                ->first();

            if (!$existing) {
                DB::table('categories')->insert([
                    'parent_id' => null,
                    'name' => $category['name'],
                    'slug' => $category['slug'],
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('✅ Categories seeded: ' . count($categories));
    }
}
