<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\ShippingMethod;
use Illuminate\Support\Facades\DB;

class OrderService
{
    /**
     * Create a complete order from validated checkout payload.
     *
     * Expected payload keys:
     *  - shipping_method_id, coupon_code (optional)
     *  - customer_name, customer_phone, customer_email (optional)
     *  - shipping_address, shipping_city, shipping_province, shipping_postal_code
     *  - items: [ { product_id, size_label, quantity, unit_price } ]
     *  - notes (optional)
     */
    public function createOrder(array $data): Order
    {
        return DB::transaction(function () use ($data) {

            // Resolve shipping method
            $shippingMethod = ShippingMethod::findOrFail($data['shipping_method_id']);

            // Resolve coupon
            $coupon         = null;
            $discountAmount = 0.00;

            if (! empty($data['coupon_code'])) {
                $coupon = Coupon::where('code', strtoupper(trim($data['coupon_code'])))->firstOrFail();

                if (! $coupon->isUsable()) {
                    throw new \InvalidArgumentException('Coupon is no longer valid.');
                }
            }

            // Calculate subtotal from items
            $subtotal = collect($data['items'])->sum(
                fn ($item) => (float) $item['unit_price'] * (int) $item['quantity']
            );

            // Calculate shipping cost (free over threshold)
            $shippingCost = (float) $shippingMethod->price;
            if ($shippingMethod->free_over !== null && $subtotal >= (float) $shippingMethod->free_over) {
                $shippingCost = 0;
            }

            // Calculate discount
            if ($coupon) {
                if (! empty($coupon->min_order_amount) && $subtotal < (float) $coupon->min_order_amount) {
                    throw new \InvalidArgumentException(
                        "Minimum order amount of {$coupon->min_order_amount} required for this coupon."
                    );
                }

                $discountAmount = $coupon->type === 'percent'
                    ? round($subtotal * ($coupon->value / 100), 2)
                    : (float) $coupon->value;

                $discountAmount = min($discountAmount, $subtotal);
            }

            $total = max(0, $subtotal - $discountAmount + $shippingCost);

            // Create order
            $order = Order::create([
                'coupon_id'           => $coupon?->id,
                'shipping_method_id'  => $shippingMethod->id,
                'customer_name'       => $data['customer_name'],
                'customer_phone'      => $data['customer_phone'],
                'customer_email'      => $data['customer_email'] ?? null,
                'shipping_address'    => $data['shipping_address'],
                'shipping_city'       => $data['shipping_city'],
                'shipping_province'   => $data['shipping_province'] ?? null,
                'shipping_postal_code'=> $data['shipping_postal_code'] ?? null,
                'subtotal'            => $subtotal,
                'discount_amount'     => $discountAmount,
                'shipping_cost'       => $shippingCost,
                'total'               => $total,
                'status'              => 'pending',
                'notes'               => $data['notes'] ?? null,
            ]);

            // Create order items + decrement stock
            foreach ($data['items'] as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'size_label' => $item['size_label'] ?? null,
                    'quantity'   => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);

                Product::where('id', $item['product_id'])
                    ->decrement('stock', $item['quantity']);
            }

            // Initial status history
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status'   => 'pending',
                'label'    => 'Order received and awaiting confirmation.',
            ]);

            // Increment coupon usage
            if ($coupon) {
                $coupon->increment('used_count');
            }

            return $order;
        });
    }
}
