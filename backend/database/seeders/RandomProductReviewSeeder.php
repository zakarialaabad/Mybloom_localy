<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Database\Seeder;

class RandomProductReviewSeeder extends Seeder
{
    public function run(): void
    {
        $sourceReviews = Review::with('images')
            ->where(function ($query) {
                $query->whereNotNull('product_id')
                    ->orWhereNotNull('order_number');
            })
            ->orderByDesc('created_at')
            ->take(100)
            ->get();

        if ($sourceReviews->isEmpty()) {
            return;
        }

        $sourceReviews = $sourceReviews->shuffle();
        $sourceCount = $sourceReviews->count();
        $sourceIndex = 0;

        foreach (Product::orderBy('id')->get(['id']) as $product) {
            $existingCount = Review::where('product_id', $product->id)->count();
            $needed = 5 - $existingCount;

            if ($needed <= 0) {
                continue;
            }

            for ($i = 0; $i < $needed; $i++) {
                $source = $sourceReviews[$sourceIndex % $sourceCount];
                $sourceIndex++;

                $review = Review::create([
                    'product_id'    => $product->id,
                    'order_number'  => null,
                    'reviewer_name' => $source->reviewer_name,
                    'rating'        => $source->rating,
                    'body'          => $source->body,
                    'is_approved'   => true,
                    'approved_at'   => now(),
                ]);

                foreach ($source->images as $image) {
                    ReviewImage::create([
                        'review_id' => $review->id,
                        'url'       => $image->url,
                    ]);
                }
            }
        }
    }
}
