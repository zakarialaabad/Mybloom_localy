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
            ProductJsonSeeder::class,
        ]);
    }
}
