<?php

namespace App\Http\Resources;

use App\Utilities\ImageUrlResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BrandResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'             => $this->id,
            'name'           => $this->name,
            'slug'           => $this->slug,
            'logo_url'       => ImageUrlResolver::resolve($this->logo_url),
            'products_count' => $this->whenCounted('products'),
        ];
    }
}
