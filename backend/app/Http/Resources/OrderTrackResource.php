<?php

namespace App\Http\Resources;

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
            'items'            => $this->whenLoaded('items', fn () =>
                $this->items->map(fn ($item) => [
                    'product_name' => $item->relationLoaded('product') ? $item->product?->name : null,
                    'size_label'   => $item->size_label,
                    'quantity'     => $item->quantity,
                    'unit_price'   => (float) $item->unit_price,
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
