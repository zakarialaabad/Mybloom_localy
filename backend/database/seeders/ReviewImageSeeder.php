<?php

namespace Database\Seeders;

use App\Services\ImageService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReviewImageSeeder extends Seeder
{
    public function run(): void
    {
        $imageService = app(ImageService::class);

        $entries = [
            ['review_id' =>  1, 'url' => 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400'],
            ['review_id' =>  2, 'url' => 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400'],
            ['review_id' =>  7, 'url' => 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400'],
            ['review_id' => 13, 'url' => 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400'],
            ['review_id' => 17, 'url' => 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400'],
            ['review_id' => 21, 'url' => 'https://images.unsplash.com/photo-1453396450673-3fe83d2db2c4?w=400'],
            ['review_id' => 26, 'url' => 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400'],
            ['review_id' => 27, 'url' => 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400'],
        ];

        foreach ($entries as $entry) {
            try {
                $result = $imageService->processFromUrl($entry['url'], 'reviews');
                DB::table('review_images')->insert([
                    'review_id'  => $entry['review_id'],
                    'url'        => $result->relativePath,
                    'created_at' => now(),
                ]);
            } catch (\Exception $e) {
                Log::warning("ReviewImageSeeder: Failed to download {$entry['url']}: {$e->getMessage()}");
                DB::table('review_images')->insert([
                    'review_id'  => $entry['review_id'],
                    'url'        => $entry['url'],
                    'created_at' => now(),
                ]);
            }
        }
    }
}
