<?php

namespace App\Services;

use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\ProductVariant;
use App\Jobs\SendAdminOrderEmail;
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
     *  - items: [ { product_id, size_id, quantity } ]
     *  - notes (optional)
     */
    public function createOrder(array $data): Order
    {
        $order = DB::transaction(function () use ($data) {

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

            // Resolve each item: validate stock at variant level, not product level
            $resolvedItems = collect($data['items'])->map(function ($item) {
                $product    = Product::findOrFail($item['product_id']);
                $sizeId     = $item['size_id'] ?? 0;
                
                // ── Stock Validation Strategy ──
                // Priority: Check variant stock first → fall back to product stock
                $availableStock = $product->stock; // Default to product-level stock
                $sizeLabel      = null;
                $unitPrice      = (float) $product->price;

                if ($sizeId > 0) {
                    // Try new ProductVariant system first
                    $variant = ProductVariant::find($sizeId);
                    
                    if ($variant && $variant->product_id === $product->id) {
                        // ✅ Use variant-level stock & price (both now correctly map to database columns)
                        $availableStock = (int) ($variant->stock_quantity ?? 0);
                        $sizeLabel      = "{$variant->size}ml";
                        $unitPrice      = (float) $variant->price;  // ✅ FIX: price (not final_price)
                    } else {
                        // Fall back to legacy ProductSize system
                        $size = ProductSize::find($sizeId);
                        
                        if ($size && $size->product_id === $product->id) {
                            $availableStock = (int) ($size->stock ?? 0);  // ✅ FIX: stock (not stock_quantity)
                            $sizeLabel      = $size->label;  // ✅ FIX: label (not volume_ml)
                            $unitPrice      = (float) ($product->price + ($size->price_modifier ?? 0));  // ✅ FIX: calculate from product price + modifier
                        } else {
                            throw new \InvalidArgumentException("Size {$sizeId} not found for product {$product->id}.");
                        }
                    }
                }

                // ✅ Check stock at the correct level (variant or product)
                if ($availableStock < $item['quantity']) {
                    $detail = $sizeLabel ? " ({$sizeLabel})" : '';
                    throw new \InvalidArgumentException(
                        "Product \"{$product->name}\"{$detail} only has {$availableStock} unit(s) in stock, but you requested {$item['quantity']}."
                    );
                }

                return [
                    'product_id'  => $item['product_id'],
                    'size_id'     => $sizeId,
                    'size_label'  => $sizeLabel,
                    'quantity'    => (int) $item['quantity'],
                    'unit_price'  => $unitPrice,
                ];
            });

            // Calculate subtotal from resolved items
            $subtotal = $resolvedItems->sum(
                fn ($item) => $item['unit_price'] * $item['quantity']
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

            // Map nested shipping_address object to flat DB columns
            $addr = $data['shipping_address'];

            // Create order
            $order = Order::create([
                'coupon_id'            => $coupon?->id,
                'shipping_method_id'   => $shippingMethod->id,
                'customer_name'        => $data['customer_name'],
                'customer_phone'       => $data['customer_phone'],
                'customer_email'       => $data['customer_email'] ?? null,
                'shipping_address'     => $addr['address'],
                'shipping_city'        => $addr['city'],
                'shipping_province'    => $addr['quartier'] ?? null,
                'shipping_postal_code' => $addr['zip'] ?? null,
                'subtotal'            => $subtotal,
                'discount_amount'     => $discountAmount,
                'shipping_cost'       => $shippingCost,
                'total'               => $total,
                'status'              => 'pending',
                'notes'               => $data['notes'] ?? null,
            ]);

            // Create order items + decrement stock at the correct level
            foreach ($resolvedItems as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'size_label' => $item['size_label'],
                    'quantity'   => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);

                // ✅ Decrement stock at variant level if size_id provided
                if ($item['size_id'] > 0) {
                    // Try new ProductVariant system
                    $variant = ProductVariant::find($item['size_id']);
                    if ($variant) {
                        $variant->decrement('stock_quantity', $item['quantity']);
                    } else {
                        // Fall back to legacy ProductSize (uses 'stock' column, not 'stock_quantity')
                        ProductSize::where('id', $item['size_id'])
                            ->decrement('stock', $item['quantity']);  // ✅ FIX: stock (not stock_quantity)
                    }
                } else {
                    // No variant → decrement product-level stock
                    Product::where('id', $item['product_id'])
                        ->decrement('stock', $item['quantity']);
                }
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

        // Dispatch admin Gmail notification after the DB transaction commits successfully
        SendAdminOrderEmail::dispatch($order->order_number);

        return $order;
    }

    /**
     * Record a status change on an existing order and create a status history entry.
     * This method does NOT enforce lifecycle transitions — the caller is responsible
     * for validating the transition is allowed (admin bypasses this for corrections).
     */
    public function recordStatusChange(Order $order, string $newStatus, string $label, ?string $location = null): void
    {
        DB::transaction(function () use ($order, $newStatus, $label, $location) {
            $order->update(['status' => $newStatus]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status'   => $newStatus,
                'label'    => $label,
                'location' => $location,
            ]);
        });
    }
}
