<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RandomProductFlagsSeeder extends Seeder
{
    /**
     * Mark random products as best sellers and gifts.
     */
    public function run(): void
    {
        $bestSellerCount = 8;
        $giftCount = 6;
        $allowOverlap = false;
        $resetFirst = false;

        if ($resetFirst) {
            DB::table('products')->update([
                'is_best_seller' => false,
                'is_featured' => false,
                'is_gift' => false,
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

        $giftQuery = DB::table('products')
            ->when(!$resetFirst, fn ($q) => $q->where('is_gift', false));

        if (!$allowOverlap) {
            $giftQuery->whereNotIn('id', $bestSellerIds)
                ->where('is_best_seller', false)
                ->where('is_featured', false);
        }

        $giftIds = $giftQuery
            ->inRandomOrder()
            ->limit($giftCount)
            ->pluck('id')
            ->all();

        if (!empty($giftIds)) {
            DB::table('products')
                ->whereIn('id', $giftIds)
                ->update(['is_gift' => true, 'updated_at' => now()]);
        }

        $this->command->info(
            'RandomProductFlagsSeeder done. Best sellers added: ' . count($bestSellerIds) .
            ', gifts added: ' . count($giftIds)
        );
    }
}
