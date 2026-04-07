<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
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
        if (str_starts_with($url, 'https://')) return $url;
        if (str_starts_with($url, 'http://')) {
            $path = parse_url($url, PHP_URL_PATH) ?? '';
            return rtrim(config('app.url'), '/') . $path;
        }
        // Only prefix Laravel storage paths with the backend URL.
        // Frontend public assets (/images/, /ingredients/, etc.) stay relative
        // so Next.js serves them directly from its own public folder.
        if (str_starts_with($url, '/storage/')) {
            return rtrim(config('app.url'), '/') . $url;
        }
        return $url;
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
            // price aliases expected by the frontend
            'price'          => (float) $this->price,
            'original_price' => $this->original_price ? (float) $this->original_price : null,
            'min_price'      => (float) $this->price,
            'max_price'      => $this->original_price ? (float) $this->original_price : (float) $this->price,
            // review aggregates injected by withAvg / withCount in the controller
            'avg_rating'     => round((float) ($this->avg_rating ?? 0), 1),
            'review_count'   => (int) ($this->review_count ?? 0),
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
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
