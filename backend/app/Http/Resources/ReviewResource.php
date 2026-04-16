<?php

namespace App\Http\Resources;

use App\Utilities\ImageUrlResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
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
        return [
            'id'            => $this->id,
            'reviewer_name' => $this->reviewer_name,
            'rating'        => $this->rating,
            'body'          => $this->body,
            'is_approved'   => $this->is_approved,
            'approved_at'   => $this->approved_at?->toISOString(),
            'images'        => $this->whenLoaded('images', fn () =>
                $this->images->map(fn ($img) => ['image_url' => $this->resolveUrl($img->url)])
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
