<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class AppSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            CategorySeederFrench::class,
            ProductTypeSeederFrench::class,
            IngredientSeederFrench::class,
            BrandCompleteSeeder::class,
            ProductJsonSeeder::class,
            BrandLogoSeeder::class,
            ShippingMethodSeeder::class,
            RandomProductFlagsSeeder::class,
            CommentReviewSeeder::class,            
            RandomProductReviewSeeder::class,
        ]);
    }
}
