<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class BrandCompleteSeeder extends Seeder
{
    /**
     * Seed all brands (extracted from former product_types list + existing).
     * Uses upsert so it is safe to run multiple times.
     */
    public function run(): void
    {
        $brands = [
            // My Bloom (in-house brand)
            ['name' => 'My Bloom',                  'slug' => 'my-bloom'],

            // 26 brands recovered from the wrongly-seeded product_types
            ['name' => 'Carolina Herrera',           'slug' => 'carolina-herrera'],
            ['name' => 'Diesel',                     'slug' => 'diesel'],
            ['name' => 'Burberry',                   'slug' => 'burberry'],
            ['name' => 'Yves Saint Laurent',         'slug' => 'yves-saint-laurent'],
            ['name' => 'Dior',                       'slug' => 'dior'],
            ['name' => 'Lancôme',                    'slug' => 'lancome'],
            ['name' => 'Dolce & Gabbana',            'slug' => 'dolce-gabbana'],
            ['name' => 'Givenchy',                   'slug' => 'givenchy'],
            ['name' => 'Nina Ricci',                 'slug' => 'nina-ricci'],
            ['name' => 'Paco Rabanne',               'slug' => 'paco-rabanne'],
            ['name' => 'Van Cleef & Arpels',         'slug' => 'van-cleef-arpels'],
            ['name' => 'Giorgio Armani',             'slug' => 'giorgio-armani'],
            ['name' => 'Arabian Oud',                'slug' => 'arabian-oud'],
            ['name' => 'Azzaro',                     'slug' => 'azzaro'],
            ['name' => 'Chanel',                     'slug' => 'chanel'],
            ['name' => 'Yves Rocher',                'slug' => 'yves-rocher'],
            ['name' => 'Prada',                      'slug' => 'prada'],
            ['name' => 'Jean Paul Gaultier',         'slug' => 'jean-paul-gaultier'],
            ['name' => "Victoria's Secret",          'slug' => 'victorias-secret'],
            ['name' => 'Zara',                       'slug' => 'zara'],
            ['name' => 'Lattafa',                    'slug' => 'lattafa'],
            ['name' => 'Maison Francis Kurkdjian',   'slug' => 'maison-francis-kurkdjian'],
            ['name' => 'Tom Ford',                   'slug' => 'tom-ford'],
            ['name' => 'Versace',                    'slug' => 'versace'],
            ['name' => 'Gucci',                      'slug' => 'gucci'],
            ['name' => 'Guerlain',                   'slug' => 'guerlain'],
            ['name' => 'Gissah',                     'slug' => 'gissah'],

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
