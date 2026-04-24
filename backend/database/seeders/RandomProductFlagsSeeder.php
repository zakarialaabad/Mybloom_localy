<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RandomProductFlagsSeeder extends Seeder
{
    /**
     * Mark random products as best sellers.
     * NOTE: Gift products are managed via the JSON seeder (ProductJsonSeeder),
     * so we don't randomly assign them here to avoid overwriting JSON-defined gifts.
     */
    public function run(): void
    {
        $bestSellerCount = 8;
        $resetFirst = false;

        if ($resetFirst) {
            DB::table('products')->update([
                'is_best_seller' => false,
                'is_featured' => false,
                'updated_at' => now(),
            ]);
        }

        $bestSellerIds = DB::table('products')
            ->when(!$resetFirst, fn ($q) => $q->where('is_best_seller', false)->where('is_featured', false))
            ->inRandomOrder()
            ->limit($bestSellerCount)
            ->pluck('id')
            ->all();

        if (!empty($bestSellerIds)) {
            DB::table('products')
                ->whereIn('id', $bestSellerIds)
                ->update(['is_best_seller' => true, 'is_featured' => true, 'updated_at' => now()]);
        }

        $this->command->info(
            'RandomProductFlagsSeeder done. Best sellers added: ' . count($bestSellerIds) .
            ', gift products are managed via JSON seeder (not randomly assigned here)'
        );
    }
}
