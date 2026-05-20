<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        DB::table('categories')->insert([
            ['id' => 1, 'parent_id' => null, 'name' => 'Corps',   'slug' => 'corps',   'sort_order' => 0, 'image_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'parent_id' => null, 'name' => 'Parfum',  'slug' => 'parfum',  'sort_order' => 0, 'image_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'parent_id' => null, 'name' => 'Cheveux', 'slug' => 'cheveux', 'sort_order' => 0, 'image_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'parent_id' => null, 'name' => 'Maison',  'slug' => 'maison',  'sort_order' => 0, 'image_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'parent_id' => null, 'name' => 'visage',  'slug' => 'visage',  'sort_order' => 0, 'image_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7, 'parent_id' => null, 'name' => 'Pack',    'slug' => 'pack',    'sort_order' => 0, 'image_url' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
