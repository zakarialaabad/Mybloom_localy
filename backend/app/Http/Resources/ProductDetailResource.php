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
            'images'         => $this->whenLoaded('images', fn () =>
                $this->images->map(fn ($img) => [
                    'id'         => $img->id,
                    'url'        => $img->url,
                    'alt'        => $img->alt,
                    'sort_order' => $img->sort_order,
                    'is_primary' => $img->is_primary,
                ])
            ),
            'sizes'          => $this->whenLoaded('sizes', fn () =>
                $this->sizes->map(fn ($s) => [
                    'id'             => $s->id,
                    'label'          => $s->label,
                    'price_modifier' => (float) $s->price_modifier,
                    'stock'          => $s->stock,
                ])
            ),
            'reviews'        => $this->whenLoaded('reviews', fn () => ReviewResource::collection($this->reviews)),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
