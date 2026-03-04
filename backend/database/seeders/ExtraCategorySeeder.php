<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ExtraCategorySeeder extends Seeder
{
    public function run(): void
    {
        // 6 new categories — 2 children of Parfums (1), 2 children of Soins du Corps (2), 2 new roots
        DB::table('categories')->insert([
            // Children of Parfums (parent_id = 1)
            [
                'id' => 7,  'parent_id' => 1, 'name' => 'Cologne',
                'slug' => 'cologne', 'sort_order' => 3,
                'image_url' => 'https://images.unsplash.com/photo-1622180568773-7a3cffc0e2c5?w=400&q=80',
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 8,  'parent_id' => 1, 'name' => 'Eau de Toilette',
                'slug' => 'eau-de-toilette', 'sort_order' => 4,
                'image_url' => 'https://images.unsplash.com/photo-1624214856494-cf75c14d7f63?w=400&q=80',
                'created_at' => now(), 'updated_at' => now(),
            ],

            // New root categories (parent_id = null)
            [
                'id' => 9,  'parent_id' => null, 'name' => 'Parfum de Nuit',
                'slug' => 'parfum-de-nuit', 'sort_order' => 4,
                'image_url' => 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&q=80',
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 10, 'parent_id' => null, 'name' => 'Coffret Cadeau',
                'slug' => 'coffret-cadeau', 'sort_order' => 5,
                'image_url' => 'https://images.unsplash.com/photo-1615529328331-f8917597711f?w=400&q=80',
                'created_at' => now(), 'updated_at' => now(),
            ],

            // Children of Soins du Corps (parent_id = 2)
            [
                'id' => 11, 'parent_id' => 2, 'name' => 'Huile Parfumée',
                'slug' => 'huile-parfumee', 'sort_order' => 2,
                'image_url' => 'https://images.unsplash.com/photo-1596462502278-27bfac188191?w=400&q=80',
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 12, 'parent_id' => 2, 'name' => 'Gommage Corps',
                'slug' => 'gommage-corps', 'sort_order' => 3,
                'image_url' => 'https://images.unsplash.com/photo-1598007264887-acc47d519b88?w=400&q=80',
                'created_at' => now(), 'updated_at' => now(),
            ],
        ]);

        Cache::forget('api.categories');
    }
}
