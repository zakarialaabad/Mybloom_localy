<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                   => $this->id,
            'order_number'         => $this->order_number,
            'status'               => $this->status,
            'customer_name'        => $this->customer_name,
            'customer_phone'       => $this->customer_phone,
            'customer_email'       => $this->customer_email,
            'shipping_address'     => $this->shipping_address,
            'shipping_city'        => $this->shipping_city,
            'shipping_province'    => $this->shipping_province,
            'shipping_postal_code' => $this->shipping_postal_code,
            'subtotal'             => (float) $this->subtotal,
            'discount_amount'      => (float) $this->discount_amount,
            'shipping_cost'        => (float) $this->shipping_cost,
            'total'                => (float) $this->total,
            'notes'                => $this->notes,
            'admin_notes'          => $this->when(request()->is('*/admin/*'), $this->admin_notes),
            'shipping_method'      => $this->whenLoaded('shippingMethod', fn () => [
                'id'   => $this->shippingMethod?->id,
                'name' => $this->shippingMethod?->name,
            ]),
            'coupon'               => $this->whenLoaded('coupon', fn () => $this->coupon ? [
                'code' => $this->coupon->code,
                'type' => $this->coupon->type,
            ] : null),
            'items'                => $this->whenLoaded('items', fn () =>
                $this->items->map(fn ($item) => [
                    'id'         => $item->id,
                    'product_id' => $item->product_id,
                    'product'    => $item->relationLoaded('product') && $item->product ? [
                        'name' => $item->product->name,
                        'slug' => $item->product->slug,
                    ] : null,
                    'size_label' => $item->size_label,
                    'quantity'   => $item->quantity,
                    'unit_price' => (float) $item->unit_price,
                    'line_total' => (float) $item->unit_price * $item->quantity,
                ])
            ),
            'status_histories'     => $this->whenLoaded('statusHistories', fn () =>
                $this->statusHistories->map(fn ($h) => [
                    'status'     => $h->status,
                    'label'      => $h->label,
                    'location'   => $h->location,
                    'created_at' => $h->created_at?->toISOString(),
                ])
            ),
            'created_at'           => $this->created_at?->toISOString(),
        ];
    }
}
