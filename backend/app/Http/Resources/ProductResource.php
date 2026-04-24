<?php

namespace App\Http\Resources;

use App\Utilities\ImageUrlResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Resolve image URL to absolute URL using ImageUrlResolver utility
     * Consolidated from duplicate resolveUrl() methods across resources
     */
    private function resolveUrl(?string $url): ?string
    {
        if (!$url) return null;
        
        // Strip embedded newline / carriage-return characters
        $url = str_replace(["\r\n", "\r", "\n"], ' ', $url);
        $url = trim($url);
        if (!$url) return null;
        
        // Delegate to centralized utility
        return ImageUrlResolver::resolve($url);
    }

    public function toArray(Request $request): array
    {
        // Default to attributes (provided by withAvg/withCount) so resources
        // that do not load the relation still have sensible values.
        $avgRating = $this->avg_rating ?? 0;
        $reviewCount = $this->review_count ?? 0;

        // Prefer computing aggregates from the loaded `approvedReviews` relation
        // (this includes feedback reviews for counting/averaging). Fall back to
        // `reviews` for backward compatibility when `approvedReviews` is not loaded.
        if ($this->relationLoaded('approvedReviews') && $this->approvedReviews instanceof \Illuminate\Support\Collection) {
            $validReviews = $this->approvedReviews;
            $avgRating = $validReviews->avg('rating') ?: 0;
            $reviewCount = $validReviews->count();
        } elseif ($this->relationLoaded('reviews') && $this->reviews instanceof \Illuminate\Support\Collection) {
            $validReviews = $this->reviews;
            $avgRating = $validReviews->avg('rating') ?: 0;
            $reviewCount = $validReviews->count();
        }

        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'subtitle'       => $this->subtitle,
            'description'    => $this->description,
            'gender'         => $this->gender,
            // price aliases expected by the frontend
            'price'          => (float) $this->price,
            'original_price' => $this->original_price ? (float) $this->original_price : null,
            'min_price'      => (float) $this->price,
            'max_price'      => $this->original_price ? (float) $this->original_price : (float) $this->price,
            // review aggregates (filtered)
            'avg_rating'     => round((float) $avgRating, 1),
            'review_count'   => (int) $reviewCount,
            'stock'          => $this->stock,
            'is_active'      => $this->is_active,
            'is_featured'    => $this->is_featured,
            'badges'         => $this->is_featured ? ['Bestseller'] : [],
            'brand'          => $this->whenLoaded('brand', fn () => [
                'id'   => $this->brand?->id,
                'name' => $this->brand?->name,
                'slug' => $this->brand?->slug,
            ]),
            'category'       => $this->whenLoaded('category', fn () => [
                'id'   => $this->category?->id,
                'name' => $this->category?->name,
                'slug' => $this->category?->slug,
            ]),
            'product_type'   => $this->whenLoaded('productType', fn () => $this->productType ? [
                'id'   => $this->productType->id,
                'name' => $this->productType->name,
                'slug' => $this->productType->slug,
            ] : null),
            // Properly resolve image URL — handles storage paths, CDN URLs, and old hosts
            'primary_image'  => $this->whenLoaded('images', function () {
                $primary = $this->images->firstWhere('is_primary', true) ?? $this->images->first();
                return $this->resolveUrl($primary?->url);
            }),
            'images'         => $this->whenLoaded('images', fn () =>
                $this->images->map(fn ($img) => [
                    'id'         => $img->id,
                    'image_url'  => $this->resolveUrl($img->url),
                    'is_primary' => $img->is_primary,
                    'sort_order' => $img->sort_order,
                ])
            ),
            'variants'       => $this->whenLoaded('variants', fn () =>
                $this->variants->map(function ($v) {
                    $base  = (float) $v->price;
                    $promo = (float) ($v->promotion_percent ?? 0);

                    $final = $promo > 0 ? round($base * (1 - $promo / 100), 2) : $base;
                    return [
                        'id'                => $v->id,
                        'size'              => (int) $v->size,
                        'unit'              => $v->unit ?? 'ml',
                        'price'             => $base,
                        'promotion_percent' => $promo,
                        'final_price'       => $final,
                        'original_price'    => $promo > 0 ? $base : null,
                        'is_default'        => (bool) $v->is_default,
                        'stock_quantity'    => (int) ($v->stock_quantity ?? 0),
                    ];
                })
            ),
            'ingredients'    => $this->whenLoaded('ingredientItems', fn () =>
                $this->ingredientItems->map(fn ($ing) => [
                    'id'   => $ing->id,
                    'name' => $ing->name,
                ])
            ),
        ];
    }

}
