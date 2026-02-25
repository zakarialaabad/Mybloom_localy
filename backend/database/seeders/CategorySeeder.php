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
            ['id' => 1, 'parent_id' => null, 'name' => 'Parfums',        'slug' => 'parfums',        'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'parent_id' => null, 'name' => 'Soins du Corps', 'slug' => 'soins-du-corps', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'parent_id' => null, 'name' => 'Nouveautés',     'slug' => 'nouveautes',     'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Child categories (parent_id references rows above)
        DB::table('categories')->insert([
            ['id' => 4, 'parent_id' => 1, 'name' => 'Eau de Parfum', 'slug' => 'eau-de-parfum', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'parent_id' => 1, 'name' => 'Body Mist',     'slug' => 'body-mist',     'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6, 'parent_id' => 2, 'name' => 'Body Butter',   'slug' => 'body-butter',   'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
