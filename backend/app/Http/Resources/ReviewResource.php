<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'reviewer_name' => $this->reviewer_name,
            'rating'        => $this->rating,
            'body'          => $this->body,
            'is_approved'   => $this->is_approved,
            'approved_at'   => $this->approved_at?->toISOString(),
            'images'        => $this->whenLoaded('images', fn () =>
                $this->images->map(fn ($img) => ['url' => $img->url])
            ),
            'product'       => $this->whenLoaded('product', fn () => $this->product ? [
                'id'   => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
            ] : null),
            'created_at'    => $this->created_at?->toISOString(),
        ];
    }
}
