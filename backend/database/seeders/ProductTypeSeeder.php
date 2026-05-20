<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductTypeSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('product_types')->insert([
            ['id' =>  1, 'name' => 'Body Butter',        'slug' => 'body_butter',        'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' =>  2, 'name' => 'Body Scrub',         'slug' => 'body_scrub',         'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' =>  3, 'name' => 'Tint Visage',        'slug' => 'tint_visage',        'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' =>  4, 'name' => 'Hair Mist',          'slug' => 'hair_mist',          'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' =>  5, 'name' => 'Body Mist',          'slug' => 'body_mist',          'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' =>  6, 'name' => 'Déodorant',          'slug' => 'deodorant',          'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' =>  7, 'name' => 'مخمرية',             'slug' => 'makhmaria',          'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' =>  8, 'name' => 'Diffuseur',          'slug' => 'diffuseur',          'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' =>  9, 'name' => "Spray d'Intérieur",  'slug' => 'spray_dinterieur',   'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 10, 'name' => 'Coffrets',           'slug' => 'coffrets',           'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 11, 'name' => 'Huile Parfumée',     'slug' => 'huile_parfumee',     'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 12, 'name' => 'Eau de Parfum',      'slug' => 'eau_de_parfum',      'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 13, 'name' => 'Musc',               'slug' => 'musc',               'sort_order' => 0, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
