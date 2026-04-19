<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('product_types')->insert([
            ['id' => 1, 'name' => 'Visage',       'slug' => 'visage',       'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2, 'name' => 'Corps',        'slug' => 'corps',        'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3, 'name' => 'Parfums',      'slug' => 'parfums',      'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4, 'name' => 'Soins Visage', 'slug' => 'soins_visage', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5, 'name' => 'Cheveux',      'slug' => 'cheveux',      'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
