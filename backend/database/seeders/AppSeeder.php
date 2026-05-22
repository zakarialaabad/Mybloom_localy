<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AppSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            BannerSeeder::class,
            CategorySeederFrench::class,
            ProductTypeSeederFrench::class,
            IngredientSeederFrench::class,
            BrandCompleteSeeder::class,
            AdminSeeder::class,
            ProductJsonSeeder::class,
            IngredientImageSeeder::class,            // fix image_url=null left by ProductJsonSeeder
            ShippingMethodSeeder::class,
            RandomProductFlagsSeeder::class,
            CommentReviewSeeder::class,            
            RandomProductReviewSeeder::class,
            HeroVideoSeeder::class
        ]);
    }
}