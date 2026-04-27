<?php

namespace App\Http\Resources;

use App\Models\Order;
use App\Utilities\ImageUrlResolver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // Precompute per-customer metrics (admin-only).
        $customerEmail = $this->customer_email;
        $customerPhone = $this->customer_phone;
        $isAdminContext = $request->is('*/admin/*');

        // Build a base query scoped to this customer (match by email or phone).
        if ($customerEmail || $customerPhone) {
            $customerQuery = Order::query();
            if ($customerEmail && $customerPhone) {
                $customerQuery->where(function ($q) use ($customerEmail, $customerPhone) {
                    $q->where('customer_email', $customerEmail)
                      ->orWhere('customer_phone', $customerPhone);
                });
            } elseif ($customerEmail) {
                $customerQuery->where('customer_email', $customerEmail);
            } else {
                $customerQuery->where('customer_phone', $customerPhone);
            }
        } else {
            // No identifier — create an impossible query so counts/sums return 0
            $customerQuery = Order::whereRaw('0 = 1');
        }

        // Exclude transient/cancelled orders from lifetime "spent" calculation
        $spendableOrdersQuery = (clone $customerQuery)->whereNotIn('status', ['pending', 'cancelled']);

        $customer_total_orders = $isAdminContext ? $spendableOrdersQuery->count() : null;
        $customer_total_spent = $isAdminContext ? (float) $spendableOrdersQuery->sum('total') : null;
        $customer_total_items = $isAdminContext
            ? (int) \App\Models\OrderItem::whereHas('order', function ($q) use ($customerEmail, $customerPhone) {
                if ($customerEmail && $customerPhone) {
                    $q->where(function ($sub) use ($customerEmail, $customerPhone) {
                        $sub->where('customer_email', $customerEmail)
                            ->orWhere('customer_phone', $customerPhone);
                    });
                } elseif ($customerEmail) {
                    $q->where('customer_email', $customerEmail);
                } elseif ($customerPhone) {
                    $q->where('customer_phone', $customerPhone);
                } else {
                    $q->whereRaw('0 = 1');
                }
            })->sum('quantity')
            : null;

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
                        // Primary image URL (prioritized) using ImageUrlResolver
                        'image_url' => $item->product->relationLoaded('images')
                            ? ImageUrlResolver::resolve(
                                $item->product->images?->firstWhere('is_primary', true)?->url 
                                ?? $item->product->images?->first()?->url 
                                ?? null
                            )
                            : null,
                        // All images array for fallback with resolved URLs
                        'images'    => $item->product->relationLoaded('images')
                            ? $item->product->images?->map(fn ($img) => [
                                'url'        => ImageUrlResolver::resolve($img->url),
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
                $isAdminContext,
                fn () => $customer_total_orders
            ),
            'customer_total_spent' => $this->when(
                $isAdminContext,
                fn () => $customer_total_spent
            ),
            'customer_total_items' => $this->when(
                $isAdminContext,
                fn () => $customer_total_items
            ),
            'created_at'           => $this->created_at?->toISOString(),
        ];
    }
}
