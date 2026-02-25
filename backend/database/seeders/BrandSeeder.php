<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BrandSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('brands')->insert([
            ['id' => 1,  'name' => 'Bloom',              'slug' => 'bloom',    'logo_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 2,  'name' => 'Chanel',             'slug' => 'chanel',   'logo_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 3,  'name' => 'Dior',               'slug' => 'dior',     'logo_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 4,  'name' => 'Lancôme',            'slug' => 'lancome',  'logo_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 5,  'name' => 'Prada',              'slug' => 'prada',    'logo_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 6,  'name' => 'Yves Saint Laurent', 'slug' => 'ysl',      'logo_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 7,  'name' => 'Versace',            'slug' => 'versace',  'logo_url' => null, 'created_at' => now(), 'updated_at' => now()],
            ['id' => 8,  'name' => 'Givenchy',           'slug' => 'givenchy', 'logo_url' => null, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
