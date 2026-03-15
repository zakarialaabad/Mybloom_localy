<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductTypeAssignSeeder extends Seeder
{
    public function run(): void
    {
        $typeIds = DB::table('product_types')->pluck('id')->toArray();

        if (empty($typeIds)) {
            $this->command->warn('No product types found. Run ProductTypeSeeder first.');
            return;
        }

        $products = DB::table('products')->pluck('id');

        foreach ($products as $productId) {
            DB::table('products')
                ->where('id', $productId)
                ->update(['product_type_id' => $typeIds[array_rand($typeIds)]]);
        }

        $this->command->info("Assigned random product types to {$products->count()} products.");
    }
}
