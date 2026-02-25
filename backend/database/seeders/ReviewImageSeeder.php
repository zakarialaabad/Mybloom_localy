<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReviewImageSeeder extends Seeder
{
    public function run(): void
    {
        // Attach 1 image to each of the first 8 approved reviews
        // review_images has no updated_at — only created_at
        DB::table('review_images')->insert([
            ['review_id' =>  1, 'url' => 'https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400', 'created_at' => now()],
            ['review_id' =>  2, 'url' => 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400', 'created_at' => now()],
            ['review_id' =>  7, 'url' => 'https://images.unsplash.com/photo-1541643600914-78b084683702?w=400', 'created_at' => now()],
            ['review_id' => 13, 'url' => 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400', 'created_at' => now()],
            ['review_id' => 17, 'url' => 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400', 'created_at' => now()],
            ['review_id' => 21, 'url' => 'https://images.unsplash.com/photo-1453396450673-3fe83d2db2c4?w=400', 'created_at' => now()],
            ['review_id' => 26, 'url' => 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400', 'created_at' => now()],
            ['review_id' => 27, 'url' => 'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400', 'created_at' => now()],
        ]);
    }
}
