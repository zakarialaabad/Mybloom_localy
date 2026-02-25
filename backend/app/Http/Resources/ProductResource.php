<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'subtitle'       => $this->subtitle,
            'gender'         => $this->gender,
            'price'          => (float) $this->price,
            'original_price' => $this->original_price ? (float) $this->original_price : null,
            'stock'          => $this->stock,
            'is_active'      => $this->is_active,
            'is_featured'    => $this->is_featured,
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
            'primary_image'  => $this->whenLoaded('images', function () {
                $primary = $this->images->firstWhere('is_primary', true) ?? $this->images->first();
                return $primary ? ['url' => $primary->url, 'alt' => $primary->alt] : null;
            }),
            'created_at'     => $this->created_at?->toISOString(),
        ];
    }
}
