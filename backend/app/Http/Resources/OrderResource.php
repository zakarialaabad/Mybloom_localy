<?php

namespace App\Http\Resources;

use App\Models\Order;
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
                        'id'        => $item->product->id,
                        'name'      => $item->product->name,
                        'slug'      => $item->product->slug,
                        // Primary image URL (prioritized)
                        'image_url' => $item->product->relationLoaded('images')
                            ? ($item->product->images?->firstWhere('is_primary', true)?->url 
                               ?? $item->product->images?->first()?->url 
                               ?? null)
                            : null,
                        // All images array for fallback
                        'images'    => $item->product->relationLoaded('images')
                            ? $item->product->images?->map(fn ($img) => [
                                'url'        => $img->url,
                                'alt'        => $img->alt,
                                'is_primary' => (bool) $img->is_primary,
                                'sort_order' => $img->sort_order,
                            ])
                            : [],
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
            'items_count'          => $this->whenHas('items_count'),
            'customer_total_orders' => $this->when(
                request()->is('*/admin/*'),
                fn () => Order::where('customer_email', $this->customer_email)
                    ->orWhere('customer_phone', $this->customer_phone)
                    ->count()
            ),
            'created_at'           => $this->created_at?->toISOString(),
        ];
    }
}
