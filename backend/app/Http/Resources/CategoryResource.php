<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'         => $this->id,
            'name'       => $this->name,
            'slug'       => $this->slug,
            'image_url'  => $this->image_url,
            'sort_order' => $this->sort_order,
            'parent_id'  => $this->parent_id,
            'children'       => $this->whenLoaded('children', fn () => CategoryResource::collection($this->children)),
            'products_count' => $this->whenCounted('products'),
        ];
    }
}
