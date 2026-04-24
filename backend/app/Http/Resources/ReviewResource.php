<?php

namespace App\Http\Resources;

use App\Models\Order;
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

    /**
     * Get customer phone: from order relation OR by matching reviewer_name to customer_name
     * This allows admin-curated reviews to show customer contact info without explicit order_number
     */
    private function getCustomerPhone(): ?string
    {
        // First try: order relation (if loaded and has a result)
        if ($this->relationLoaded('order') && $this->order?->customer_phone) {
            return $this->order->customer_phone;
        }

        // Fallback: lookup order by customer_name matching reviewer_name
        // Use most recent order for that customer (in case multiple orders exist)
        $matchingOrder = Order::where('customer_name', $this->reviewer_name)
            ->orderBy('created_at', 'desc')
            ->first();

        return $matchingOrder?->customer_phone;
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
            'status'        => $this->status ?? 'pending',
            // Customer phone from order (direct relation or by name lookup)
            'customer_phone' => $this->getCustomerPhone(),
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
