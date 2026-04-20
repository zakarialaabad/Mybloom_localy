<?php

namespace App\Http\Resources;

use App\Utilities\ImageUrlResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Lightweight order tracking resource for public-facing track endpoint.
 * Does NOT expose admin_notes or customer email.
 */
class OrderTrackResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'order_number'     => $this->order_number,
            'status'           => $this->status,
            'customer_name'    => $this->customer_name,
            'shipping_address' => $this->shipping_address,
            'shipping_city'    => $this->shipping_city,
            'total'            => (float) $this->total,
            'shipping_method'  => $this->whenLoaded('shippingMethod', fn () => [
                'name' => $this->shippingMethod?->name,
            ]),
            'subtotal'         => (float) $this->subtotal,
            'shipping_cost'    => (float) $this->shipping_cost,
            'coupon_discount'  => (float) $this->discount_amount,
            'items'            => $this->whenLoaded('items', fn () =>
                $this->items->map(fn ($item) => [
                    'product_id'        => $item->product_id,
                    'product_name'      => $item->product?->name,
                    'product_size_label'=> $item->size_label,
                    'quantity'          => $item->quantity,
                    'unit_price'        => (float) $item->unit_price,
                    'image_url'         => ImageUrlResolver::resolve(
                        $item->product?->images?->firstWhere('is_primary', true)?->url
                        ?? $item->product?->images?->first()?->url
                    ),
                ])
            ),
            'status_histories' => $this->whenLoaded('statusHistories', fn () =>
                $this->statusHistories->map(fn ($h) => [
                    'status'     => $h->status,
                    'label'      => $h->label,
                    'location'   => $h->location,
                    'created_at' => $h->created_at?->toISOString(),
                ])
            ),
            'created_at'       => $this->created_at?->toISOString(),
        ];
    }
}
