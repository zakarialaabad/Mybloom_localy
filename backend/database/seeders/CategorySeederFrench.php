<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeederFrench extends Seeder
{
    /**
     * Seed the categories table with the exact categories from the current database.
     */
    public function run(): void
    {
        $categories = [
            ['id' => 1, 'name' => 'Corps',   'slug' => 'corps'],
            ['id' => 2, 'name' => 'Parfum',  'slug' => 'parfum'],
            ['id' => 3, 'name' => 'Cheveux', 'slug' => 'cheveux'],
            ['id' => 4, 'name' => 'Maison',  'slug' => 'maison'],
            ['id' => 5, 'name' => 'visage',  'slug' => 'visage'],
            ['id' => 7, 'name' => 'Pack',    'slug' => 'pack'],
        ];

        foreach ($categories as $category) {
            $existing = DB::table('categories')
                ->where('slug', $category['slug'])
                ->where('parent_id', null)
                ->first();

            if (!$existing) {
                DB::table('categories')->insert([
                    'parent_id'  => null,
                    'name'       => $category['name'],
                    'slug'       => $category['slug'],
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('✅ Categories seeded: ' . count($categories));
    }
}
