<?php

namespace Database\Seeders;

use App\Models\Product;
use Illuminate\Database\Seeder;

class ProductSeeder extends Seeder
{
    public function run(): void
    {
        $products = [
            ['name' => 'Midnight Oud',     'category' => 'Oriental',   'price' => 129.99, 'stock' => 50],
            ['name' => 'Rose de Grasse',   'category' => 'Floral',     'price' => 99.99,  'stock' => 75],
            ['name' => 'Cedar & Vetiver',  'category' => 'Woody',      'price' => 89.99,  'stock' => 60],
            ['name' => 'Aqua Neroli',      'category' => 'Fresh',      'price' => 79.99,  'stock' => 100],
            ['name' => 'Tobacco Vanille',  'category' => 'Oriental',   'price' => 149.99, 'stock' => 40],
            ['name' => 'Bergamot Blanc',   'category' => 'Citrus',     'price' => 69.99,  'stock' => 80],
        ];

        foreach ($products as $data) {
            Product::firstOrCreate(
                ['name' => $data['name']],
                array_merge($data, [
                    'description' => "A luxurious {$data['category']} fragrance that captivates the senses.",
                ]),
            );
        }

        $this->command->info('Products seeded.');
    }
}
