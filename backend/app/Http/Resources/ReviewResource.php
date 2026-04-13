<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
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
        if (str_starts_with($url, 'https://')) return $url;
        if (str_starts_with($url, 'http://')) {
            $path = parse_url($url, PHP_URL_PATH) ?? '';
            return rtrim(config('app.url'), '/') . $path;
        }
        if (str_starts_with($url, '/storage/')) {
            return rtrim(config('app.url'), '/') . $url;
        }
        return $url;
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
