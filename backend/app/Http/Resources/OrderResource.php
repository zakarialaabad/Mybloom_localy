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
        // Use the global request helper like other parts of the resource to ensure
        // the same admin-detection behaviour used elsewhere in the app.
        $isAdminContext = request()->is('*/admin/*');

        // Normalize phone on PHP side (digits only) to help match different
        // storage formats (spaces, +, dashes, parentheses).
        $normalizedPhone = $customerPhone ? preg_replace('/\D+/', '', $customerPhone) : null;

        // SQL expression to strip common non-digit characters from stored phone
        // numbers so we can compare normalized values reliably.
        $sqlPhoneNormalized = "REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(customer_phone, ' ', ''), '+', ''), '-', ''), '.', ''), '(', ''), ')', '')";

        // Build a base query scoped to this customer (match by email or phone).
        $customerQuery = Order::query();
        if ($customerEmail || $customerPhone) {
            $customerQuery->where(function ($q) use ($customerEmail, $customerPhone, $normalizedPhone, $sqlPhoneNormalized) {
                if ($customerEmail) {
                    $q->where('customer_email', $customerEmail);
                }

                if ($customerPhone) {
                    // try exact match first, then compare normalized forms
                    $q->orWhere('customer_phone', $customerPhone);
                    if ($normalizedPhone) {
                        $q->orWhereRaw("{$sqlPhoneNormalized} = ?", [$normalizedPhone]);
                    }
                }
            });
        } else {
            // No identifier — make query impossible so aggregates return 0
            $customerQuery->whereRaw('0 = 1');
        }

        // Exclude transient/cancelled orders from lifetime "spent" calculation
        $spendableOrdersQuery = (clone $customerQuery)->whereNotIn('status', ['pending', 'cancelled']);

        $customer_total_orders = $isAdminContext ? $spendableOrdersQuery->count() : null;
        $customer_total_spent = $isAdminContext ? (float) $spendableOrdersQuery->sum('total') : null;
        $customer_total_items = $isAdminContext
            ? (int) \App\Models\OrderItem::whereHas('order', function ($q) use ($customerEmail, $customerPhone, $normalizedPhone, $sqlPhoneNormalized) {
                $q->where(function ($sub) use ($customerEmail, $customerPhone, $normalizedPhone, $sqlPhoneNormalized) {
                    if ($customerEmail) {
                        $sub->where('customer_email', $customerEmail);
                    }
                    if ($customerPhone) {
                        $sub->orWhere('customer_phone', $customerPhone);
                        if ($normalizedPhone) {
                            $sub->orWhereRaw("{$sqlPhoneNormalized} = ?", [$normalizedPhone]);
                        }
                    }
                });
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
