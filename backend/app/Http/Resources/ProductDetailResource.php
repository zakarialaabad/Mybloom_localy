<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductDetailResource extends JsonResource
{
    /**
     * Normalise any image URL to an absolute URL using the current APP_URL.
     * Handles three cases:
     *  - https://... (CDN / Unsplash) — returned as-is
     *  - http://...  (possibly old IP/host) — host replaced with APP_URL
     *  - /storage/...  (relative path) — prefixed with APP_URL
     */
    private function resolveUrl(?string $url): ?string
    {
        if (!$url) return null;
        // Strip embedded newline / carriage-return characters that can end up in
        // DB rows when seeders are copy-pasted from Windows text files.
        $url = str_replace(["\r\n", "\r", "\n"], ' ', $url);
        $url = trim($url);
        if (!$url) return null;

        // Delegate to centralized resolver which handles all path formats:
        // - full URLs (https://...) → as-is
        // - frontend paths (/images/, /comments/) → as-is (served by Next.js)
        // - storage paths (products/xxx.webp, /storage/xxx) → APP_URL + /storage/...
        return \App\Utilities\ImageUrlResolver::resolve($url);
    }

    /**
     * price_modifier stores the absolute base price the admin typed (e.g. 600 DH).
     * product.price is the computed final selling price (stored by the controller).
     * We use price_modifier directly — NOT product.price + price_modifier.
     */
    private function calculateFinalPrice($size): float
    {
        $base      = round((float) $size->price_modifier, 2);
        $promotion = (float) ($size->promotion_percent ?? 0);
        return $promotion > 0 ? round($base * (1 - $promotion / 100), 2) : $base;
    }

    private function calculateOriginalPrice($size): ?float
    {
        $promotion = (float) ($size->promotion_percent ?? 0);
        if ($promotion <= 0) {
            return null;
        }
        // The base price the admin typed is the original (pre-discount) price
        return round((float) $size->price_modifier, 2);
    }

    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'subtitle'       => $this->subtitle,
            'description'    => $this->description,
            'gender'         => $this->gender,
            'price'          => (float) $this->price,
            'original_price' => $this->original_price ? (float) $this->original_price : null,
            'stock'          => $this->stock,
            'is_active'      => $this->is_active,
            'is_featured'    => $this->is_featured,
            'is_best_seller' => (bool) $this->is_best_seller,
            'is_gift'        => (bool) $this->is_gift,
            'is_recommended' => (bool) $this->is_recommended,
            // price aliases expected by the frontend
            'min_price'      => (float) $this->price,
            'max_price'      => $this->original_price ? (float) $this->original_price : (float) $this->price,
            // review aggregates injected by withAvg / withCount in the controller
            'avg_rating'     => round((float) ($this->avg_rating ?? 0), 1),
            'review_count'   => (int) ($this->review_count ?? 0),
            'badges'         => $this->is_featured ? ['Bestseller'] : [],
            'brand'          => $this->whenLoaded('brand', fn () => [
                'id'       => $this->brand?->id,
                'name'     => $this->brand?->name,
                'slug'     => $this->brand?->slug,
                'logo_url' => $this->resolveUrl($this->brand?->logo_url),
            ]),
            'category'       => $this->whenLoaded('category', fn () => [
                'id'   => $this->category?->id,
                'name' => $this->category?->name,
                'slug' => $this->category?->slug,
            ]),
            'product_type'   => $this->whenLoaded('productType', fn () => $this->productType ? [
                'id'   => $this->productType->id,
                'name' => $this->productType->name,
            ] : null),
            // String URL for components that use primary_image directly
            'primary_image'  => $this->whenLoaded('images', function () {
                $primary = $this->images->firstWhere('is_primary', true) ?? $this->images->first();
                return $this->resolveUrl($primary?->url);
            }),
            'images'         => $this->whenLoaded('images', fn () =>
                $this->images->map(fn ($img) => [
                    'id'         => $img->id,
                    'image_url'  => $this->resolveUrl($img->url),
                    'alt'        => $img->alt,
                    'sort_order' => $img->sort_order,
                    'is_primary' => $img->is_primary,
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
                    'id'        => $ing->id,
                    'name'      => $ing->name,
                    'image_url' => $this->resolveUrl($ing->image_url),
                ])
            ),
            'reviews'        => $this->whenLoaded('reviews', fn () => ReviewResource::collection($this->reviews)),
            'all_reviews'    => $this->whenLoaded('allReviews', fn () =>
                $this->allReviews->map(fn ($r) => [
                    'id'            => $r->id,
                    'reviewer_name' => $r->reviewer_name,
                    'rating'        => (int) $r->rating,
                    'comment'       => $r->body,
                    'date'          => $r->created_at?->toDateString(),
                    'photo_url'     => $this->resolveUrl($r->images->first()?->url ?? null),
                ])
            ),
            'faqs'           => $this->whenLoaded('faqs', fn () =>
                $this->faqs->map(fn ($f) => [
                    'id'       => $f->id,
                    'question' => $f->question,
                    'answer'   => $f->answer,
                ])
            ),
            // ── Recommended products — pre-cached by controller, limited to 8 ──
            // Previously this fired a raw DB query for 74+ products inside toArray().
            // Now we use the preloaded cachedRecommendations relation set by the controller.
            'recommendations' => $this->getRecommendations(),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }

    /**
     * Serialize the pre-cached recommendations collection that was injected
     * by the controller via $product->setRelation('cachedRecommendations', ...).
     *
     * This replaces the old raw DB query that ran inside toArray() on every request
     * and fetched 74+ products with all their images every single time.
     */
    private function getRecommendations(): array
    {
        $items = $this->resource->relationLoaded('cachedRecommendations')
            ? $this->resource->getRelation('cachedRecommendations')
            : collect();

        return $items->map(fn ($product) => [
            'id'              => $product->id,
            'name'            => $product->name,
            'slug'            => $product->slug,
            'subtitle'        => $product->subtitle,
            'price'           => (float) $product->price,
            'min_price'       => (float) $product->price,
            'max_price'       => $product->original_price ? (float) $product->original_price : (float) $product->price,
            'original_price'  => $product->original_price ? (float) $product->original_price : null,
            'stock'           => (int) $product->stock,
            'is_active'       => (bool) $product->is_active,
            'is_featured'     => (bool) $product->is_featured,
            'is_best_seller'  => (bool) $product->is_best_seller,
            'is_gift'         => (bool) $product->is_gift,
            'is_recommended'  => (bool) $product->is_recommended,
            'avg_rating'      => round((float) ($product->avg_rating ?? 0), 1),
            'review_count'    => (int) ($product->review_count ?? 0),
            'primary_image'   => $this->resolveUrl(
                $product->images->firstWhere('is_primary', true)?->url ?? $product->images->first()?->url
            ),
            'images'          => $product->images->map(fn ($img) => [
                'id'         => $img->id,
                'image_url'  => $this->resolveUrl($img->url),
                'alt'        => $img->alt ?? null,
                'sort_order' => $img->sort_order,
                'is_primary' => $img->is_primary,
            ]),
            'brand'           => $product->brand ? [
                'id'   => $product->brand->id,
                'name' => $product->brand->name,
                'slug' => $product->brand->slug,
            ] : null,
            'badges'          => $product->is_best_seller ? ['Best Seller'] : [],
        ])->toArray();
    }
}
