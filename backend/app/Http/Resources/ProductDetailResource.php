<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductDetailResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'subtitle'       => $this->subtitle,
            'description'    => $this->description,
            'ingredients'    => $this->ingredients,
            'gender'         => $this->gender,
            'price'          => (float) $this->price,
            'original_price' => $this->original_price ? (float) $this->original_price : null,
            'stock'          => $this->stock,
            'is_active'      => $this->is_active,
            'is_featured'    => $this->is_featured,
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
                'logo_url' => $this->brand?->logo_url,
            ]),
            'category'       => $this->whenLoaded('category', fn () => [
                'id'   => $this->category?->id,
                'name' => $this->category?->name,
                'slug' => $this->category?->slug,
            ]),
            // String URL for components that use primary_image directly
            'primary_image'  => $this->whenLoaded('images', function () {
                $primary = $this->images->firstWhere('is_primary', true) ?? $this->images->first();
                return $primary?->url;
            }),
            'images'         => $this->whenLoaded('images', fn () =>
                $this->images->map(fn ($img) => [
                    'id'         => $img->id,
                    'image_url'  => $img->url,
                    'alt'        => $img->alt,
                    'sort_order' => $img->sort_order,
                    'is_primary' => $img->is_primary,
                ])
            ),
            'sizes'          => $this->whenLoaded('sizes', fn () =>
                $this->sizes->map(fn ($s) => [
                    'id'             => $s->id,
                    'volume_ml'      => (int) $s->label,
                    'label'          => $s->label,
                    'price'          => round((float) $this->price + (float) $s->price_modifier, 2),
                    'original_price' => null,
                    'stock_quantity' => (int) $s->stock,
                    'sku'            => null,
                ])
            ),
            'reviews'        => $this->whenLoaded('reviews', fn () => ReviewResource::collection($this->reviews)),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
