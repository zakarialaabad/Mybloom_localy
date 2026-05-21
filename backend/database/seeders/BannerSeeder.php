<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $banners = [
            // ── homepage_slot ──────────────────────────────────────────────
            [
                'id'            => 31,
                'title'         => null,
                'image_path'    => 'banners/301ioVjBplqZ6y25E4Eo6jZeMXvBnd8u.webp',
                'type'          => 'homepage_slot',
                'collection_id' => null,
                'position'      => 1,
                'link'          => null,
                'is_active'     => true,
            ],
            [
                'id'            => 34,
                'title'         => null,
                'image_path'    => 'banners/zMlr90RvpsWd23nsgYs2NMeRvT34CsaN.webp',
                'type'          => 'homepage_slot',
                'collection_id' => null,
                'position'      => 2,
                'link'          => null,
                'is_active'     => true,
            ],
            [
                'id'            => 35,
                'title'         => null,
                'image_path'    => 'banners/Quq6Uxu9nvb3h3w6ASQFri54A5j1wLvQ.webp',
                'type'          => 'homepage_slot',
                'collection_id' => null,
                'position'      => 3,
                'link'          => null,
                'is_active'     => true,
            ],
            [
                'id'            => 37,
                'title'         => null,
                'image_path'    => 'banners/6kBG7qvLjhlrns8AlV4YWGhbFEOufHfu.webp',
                'type'          => 'homepage_slot',
                'collection_id' => null,
                'position'      => 4,
                'link'          => null,
                'is_active'     => true,
            ],
            // ── collection_hero ────────────────────────────────────────────
            [
                'id'            => 32,
                'title'         => null,
                'image_path'    => 'banners/UeyLiBGyVcW3iMGZ4vJRGrAbuXrk2PwE.webp',
                'type'          => 'collection_hero',
                'collection_id' => null,
                'position'      => 1,
                'link'          => null,
                'is_active'     => true,
            ],
        ];

        foreach ($banners as $banner) {
            $exists = DB::table('banners')->where('id', $banner['id'])->exists();

            if (!$exists) {
                DB::table('banners')->insert([
                    'id'            => $banner['id'],
                    'title'         => $banner['title'],
                    'image_path'    => $banner['image_path'],
                    'type'          => $banner['type'],
                    'collection_id' => $banner['collection_id'],
                    'position'      => $banner['position'],
                    'link'          => $banner['link'],
                    'is_active'     => $banner['is_active'],
                    'created_at'    => now(),
                    'updated_at'    => now(),
                ]);
            }
        }

        $this->command->info('✅ BannerSeeder done — 5 banners (4 homepage_slot + 1 collection_hero)');
    }
}
