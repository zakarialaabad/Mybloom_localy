<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class BrandCompleteSeeder extends Seeder
{
    /**
     * Seed all brands from the current database state.
     * Uses upsert so it is safe to run multiple times.
     */
    public function run(): void
    {
        $brands = [
            // id=1
            ['name' => 'My Bloom',              'slug' => 'my-bloom'],
            // id=2
            ['name' => 'Caroline Herrera',      'slug' => 'caroline-herrera'],
            // id=3
            ['name' => 'Diesel',                'slug' => 'diesel'],
            // id=4
            ['name' => 'Burberry',              'slug' => 'burberry'],
            // id=5
            ['name' => 'Yves Saint Laurent',    'slug' => 'yves-saint-laurent'],
            // id=6
            ['name' => 'Dior',                  'slug' => 'dior'],
            // id=7
            ['name' => 'Lancôme',               'slug' => 'lancome'],
            // id=8
            ['name' => 'Dolce & Gabbana',       'slug' => 'dolce-gabbana'],
            // id=9
            ['name' => 'Givenchy',              'slug' => 'givenchy'],
            // id=10
            ['name' => 'Nina',                  'slug' => 'nina'],
            // id=11
            ['name' => 'Paco Rabanne',          'slug' => 'paco-rabanne'],
            // id=13
            ['name' => 'Armani',                'slug' => 'armani'],
            // id=14
            ['name' => 'Arabian Oud',           'slug' => 'arabian-oud'],
            // id=15
            ['name' => 'Azzaro',                'slug' => 'azzaro'],
            // id=16
            ['name' => 'Chanel',                'slug' => 'chanel'],
            // id=17
            ['name' => 'Yves Rocher',           'slug' => 'yves-rocher'],
            // id=18
            ['name' => 'Prada',                 'slug' => 'prada'],
            // id=19
            ['name' => 'Jean Paul Gaultier',    'slug' => 'jean-paul-gaultier'],
            // id=20
            ['name' => "Victoria's Secret",     'slug' => 'victorias-secret'],
            // id=21
            ['name' => 'Zara',                  'slug' => 'zara'],
            // id=22
            ['name' => 'Lattafa',               'slug' => 'lattafa'],
            // id=23
            ['name' => 'Francis Kurkdjian',     'slug' => 'francis-kurkdjian'],
            // id=24
            ['name' => 'Tom Ford',              'slug' => 'tom-ford'],
            // id=25
            ['name' => 'Versace',               'slug' => 'versace'],
            // id=26
            ['name' => 'Gucci',                 'slug' => 'gucci'],
            // id=27
            ['name' => 'Guerlain',              'slug' => 'guerlain'],
            // id=28
            ['name' => 'قصة',                  'slug' => 'gissah'],
            // id=30
            ['name' => 'Lacoste',               'slug' => 'lacoste'],
            // id=31
            ['name' => 'Hugo Boss',             'slug' => 'hugo-boss'],
            // id=32
            ['name' => 'Elie saab',             'slug' => 'elie-saab'],
            // id=33
            ['name' => 'Escada',                'slug' => 'escada'],
            // id=34
            ['name' => 'Mugler',                'slug' => 'mugler'],
            // id=35
            ['name' => 'Laverne',               'slug' => 'laverne'],
        ];

        $inserted = 0;
        $skipped  = 0;

        foreach ($brands as $brand) {
            $exists = DB::table('brands')->where('slug', $brand['slug'])->exists();

            if ($exists) {
                $skipped++;
                continue;
            }

            DB::table('brands')->insert([
                'name'       => $brand['name'],
                'slug'       => $brand['slug'],
                'logo_url'   => null,
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            $inserted++;
        }

        $this->command->info("✅ BrandCompleteSeeder done — inserted: {$inserted}, skipped (already exist): {$skipped}");
        Cache::forget('api.brands');
        $this->command->info('🗑  Cache api.brands cleared.');
    }
}
