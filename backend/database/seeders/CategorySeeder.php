<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        // Parent categories first (parent_id = null)
        DB::table('categories')->insert([
            ['id' => 1, 'parent_id' => null, 'name' => 'Parfums',        'slug' => 'parfums',        'sort_order' => 1, 'image_url' => 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400&q=80', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'parent_id' => null, 'name' => 'Soins du Corps', 'slug' => 'soins-du-corps', 'sort_order' => 2, 'image_url' => 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'parent_id' => null, 'name' => 'Nouveautés',     'slug' => 'nouveautes',     'sort_order' => 3, 'image_url' => 'https://images.unsplash.com/photo-1615397349754-cfa2066a298e?w=400&q=80', 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Child categories (parent_id references rows above)
        DB::table('categories')->insert([
            ['id' => 4, 'parent_id' => 1, 'name' => 'Eau de Parfum', 'slug' => 'eau-de-parfum', 'sort_order' => 1, 'image_url' => 'https://images.unsplash.com/photo-1588776814546-ec7e878c5e4d?w=400&q=80', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'parent_id' => 1, 'name' => 'Body Mist',     'slug' => 'body-mist',     'sort_order' => 2, 'image_url' => 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400&q=80', 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'parent_id' => 2, 'name' => 'Body Butter',   'slug' => 'body-butter',   'sort_order' => 1, 'image_url' => 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=400&q=80', 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
