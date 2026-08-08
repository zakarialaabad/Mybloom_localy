<?php

namespace App\Services;

use App\Jobs\SendAdminOrderEmail;
use App\Jobs\SendAdminOrderWhatsAppNotification;
use App\Jobs\SendOrderWhatsAppConfirmation;
use App\Models\AdminOrderWhatsAppNotification;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\OrderWhatsAppDelivery;
use App\Models\Product;
use App\Models\ProductSize;
use App\Models\ProductVariant;
use App\Models\ShippingMethod;
use App\Support\WhatsAppPhone;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Throwable;

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
        if (! (bool) ($data['whatsapp_confirmation_requested'] ?? false)) {
            throw new \InvalidArgumentException('WhatsApp confirmation consent is required to place an order.');
        }

        // The service is also used outside the HTTP controller, so normalization
        // belongs here rather than only in StoreOrderRequest.
        $data['customer_phone'] = WhatsAppPhone::normalizeMoroccan((string) ($data['customer_phone'] ?? ''));
        if ($data['customer_phone'] === (string) config('services.openwa.owner_e164')) {
            throw new \InvalidArgumentException('The customer WhatsApp number cannot be the MyBloom sender number.');
        }

        [$order, $fallbackUrl] = DB::transaction(function () use ($data) {

            // Resolve shipping method
            $shippingMethod = ShippingMethod::findOrFail($data['shipping_method_id']);

            // Resolve coupon
            $coupon = null;
            $discountAmount = 0.00;

            if (! empty($data['coupon_code'])) {
                $coupon = Coupon::where('code', strtoupper(trim($data['coupon_code'])))->firstOrFail();

                if (! $coupon->isUsable()) {
                    throw new \InvalidArgumentException('Coupon is no longer valid.');
                }
            }

            // Resolve each item: validate stock at variant level, not product level
            $resolvedItems = collect($data['items'])->map(function ($item) {
                $product = Product::findOrFail($item['product_id']);
                $sizeId = $item['size_id'] ?? 0;

                // ── Stock Validation Strategy ──
                // Priority: Check variant stock first → fall back to product stock
                $availableStock = $product->stock; // Default to product-level stock
                $sizeLabel = null;
                $unitPrice = (float) ($product->sale_price ?? $product->price);
                $variant = null;

                if ($sizeId > 0) {
                    // Try new ProductVariant system first
                    $variant = ProductVariant::find($sizeId);

                    if ($variant && $variant->product_id === $product->id) {
                        // ✅ Use variant-level stock & price (both now correctly map to database columns)
                        $availableStock = (int) ($variant->stock_quantity ?? 0);
                        $unit = $variant->unit ?? 'ml';
                        $sizeLabel = "{$variant->size}{$unit}";
                        // Apply promotion_percent discount if set
                        $basePrice = (float) $variant->price;
                        $promoPercent = (float) ($variant->promotion_percent ?? 0);
                        $unitPrice = $promoPercent > 0
                            ? round($basePrice * (1 - $promoPercent / 100), 2)
                            : $basePrice;
                    } else {
                        // Fall back to legacy ProductSize system
                        $size = ProductSize::find($sizeId);

                        if ($size && $size->product_id === $product->id) {
                            $availableStock = (int) ($size->stock ?? 0);  // ✅ FIX: stock (not stock_quantity)
                            $sizeLabel = $size->label;  // ✅ FIX: label (not volume_ml)
                            $unitPrice = (float) (($product->sale_price ?? $product->price) + ($size->price_modifier ?? 0));  // ✅ FIX: calculate from product price + modifier
                        }
                        // else: stale/invalid sizeId (variant was deleted) → use product-level price/stock
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
                    'product_id' => $item['product_id'],
                    'product_name' => $product->name,
                    'variant_id' => $variant?->id,
                    'size_id' => $sizeId,
                    'size_label' => $sizeLabel,
                    'quantity' => (int) $item['quantity'],
                    'unit_price' => $unitPrice,
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
                'coupon_id' => $coupon?->id,
                'shipping_method_id' => $shippingMethod->id,
                'customer_name' => $data['customer_name'],
                'customer_phone' => $data['customer_phone'],
                'customer_email' => $data['customer_email'] ?? null,
                'shipping_address' => $addr['address'],
                'shipping_city' => $addr['city'],
                'shipping_province' => $addr['quartier'] ?? null,
                'shipping_postal_code' => $addr['zip'] ?? null,
                'subtotal' => $subtotal,
                'discount_amount' => $discountAmount,
                'shipping_cost' => $shippingCost,
                'total' => $total,
                'status' => 'pending',
                'payment_method' => 'cash_on_delivery',
                'payment_status' => 'pending',
                'notes' => $data['notes'] ?? null,
                'whatsapp_confirmation_requested' => true,
                'whatsapp_consent_at' => now(),
                'whatsapp_consent_source' => 'checkout',
                'whatsapp_confirmation_status' => 'pending',
            ]);

            // Create order items + decrement stock at the correct level
            foreach ($resolvedItems as $item) {
                $order->items()->create([
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'variant_id' => $item['variant_id'],
                    'size_label' => $item['size_label'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price'],
                ]);

                // Decrement stock using the already-resolved variant_id
                if ($item['variant_id']) {
                    ProductVariant::where('id', $item['variant_id'])
                        ->decrement('stock_quantity', $item['quantity']);
                } elseif ($item['size_id'] > 0) {
                    // Legacy ProductSize fallback
                    ProductSize::where('id', $item['size_id'])
                        ->decrement('stock', $item['quantity']);
                } else {
                    // No variant → decrement product-level stock
                    Product::where('id', $item['product_id'])
                        ->decrement('stock', $item['quantity']);
                }
            }

            // Initial status history
            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => 'pending',
                'label' => 'Order received and awaiting confirmation.',
            ]);

            // Increment coupon usage
            if ($coupon) {
                $coupon->increment('used_count');
            }

            // One persistent delivery row is the idempotency key. The claim
            // code is returned once to the just-created checkout response;
            // only its hash is retained server-side.
            $claimCode = strtoupper(bin2hex(random_bytes(8)));
            $delivery = OrderWhatsAppDelivery::create([
                'order_id' => $order->id,
                'purpose' => OrderWhatsAppDelivery::PURPOSE_CONFIRMATION,
                'recipient_original' => (string) ($data['customer_phone_original'] ?? $data['customer_phone']),
                'recipient_e164' => $order->customer_phone,
                'consent_at' => $order->whatsapp_consent_at,
                'status' => 'queued',
                'fallback_token_hash' => hash('sha256', $claimCode),
                'fallback_expires_at' => now()->addHours((int) config('services.openwa.fallback_token_ttl_hours')),
            ]);

            // This is intentionally a different table from the customer's
            // confirmation delivery. Its unique order_id is the durable
            // idempotency key for the fixed internal admin alert.
            AdminOrderWhatsAppNotification::create([
                'order_id' => $order->id,
                'recipient_e164' => (string) config('services.openwa.admin_recipient_e164'),
                'status' => 'queued',
            ]);

            $owner = (string) config('services.openwa.owner_e164');
            // The customer sends this one-time code to initiate a fresh chat
            // when WhatsApp drops a cold automatic message.
            $claim = rawurlencode('CONFIRM '.$order->order_number.' '.$claimCode);

            return [$order, 'https://wa.me/'.$owner.'?text='.$claim];
        });

        $order->setAttribute('whatsapp_fallback_url', $fallbackUrl);

        // Dispatch only after the order transaction has committed. Put the
        // customer confirmation first so a separate admin-email outage can
        // never prevent an otherwise valid customer notification from queuing.
        try {
            SendOrderWhatsAppConfirmation::dispatch($order->id)->afterCommit();
        } catch (Throwable) {
            OrderWhatsAppDelivery::where('order_id', $order->id)
                ->where('purpose', OrderWhatsAppDelivery::PURPOSE_CONFIRMATION)
                ->where('status', 'queued')
                ->update([
                    'status' => 'failed',
                    'fallback_available_at' => now(),
                    'last_error_code' => 'queue_dispatch_failed',
                    'last_error_message' => 'WhatsApp confirmation could not be queued.',
                ]);

            Order::whereKey($order->id)
                ->where('whatsapp_confirmation_status', 'pending')
                ->update([
                    'whatsapp_confirmation_status' => 'failed',
                    'whatsapp_confirmation_failed_at' => now(),
                    'whatsapp_confirmation_error' => 'WhatsApp confirmation could not be queued.',
                ]);

            Log::warning('Order WhatsApp confirmation could not be queued.', [
                'order_id' => $order->id,
                'order_reference' => $order->order_number,
                'notification_status' => 'failed',
            ]);
        }

        try {
            SendAdminOrderEmail::dispatch($order->order_number);
        } catch (Throwable $e) {
            Log::warning('Admin order email could not be queued.', [
                'order_id' => $order->id,
                'order_reference' => $order->order_number,
                'error_type' => $e::class,
            ]);
        }

        // A separate after-commit job makes the internal alert independent of
        // checkout, invoice generation, payment, and customer WhatsApp flow.
        // Dispatch failure is recorded and never affects the saved order.
        try {
            SendAdminOrderWhatsAppNotification::dispatch($order->id)->afterCommit();
        } catch (Throwable $e) {
            AdminOrderWhatsAppNotification::where('order_id', $order->id)
                ->where('status', 'queued')
                ->update([
                    'status' => 'failed',
                    'failed_at' => now(),
                    'last_error_code' => 'queue_dispatch_failed',
                    'last_error_message' => 'Admin WhatsApp notification could not be queued.',
                ]);

            Log::warning('Admin order WhatsApp notification could not be queued.', [
                'order_id' => $order->id,
                'order_reference' => $order->order_number,
                'error_type' => $e::class,
            ]);
        }

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
            $previousStatus = $order->status;

            $order->update(['status' => $newStatus]);

            OrderStatusHistory::create([
                'order_id' => $order->id,
                'status' => $newStatus,
                'label' => $label,
                'location' => $location,
            ]);

            // Restore stock when an order is cancelled (only once: skip if already cancelled)
            if ($newStatus === 'cancelled' && $previousStatus !== 'cancelled') {
                $this->restoreStock($order);
            }
        });
    }

    /**
     * Restore stock for all items of a cancelled order.
     * Increments the same stock field that was decremented at order creation.
     */
    private function restoreStock(Order $order): void
    {
        $order->loadMissing('items');

        foreach ($order->items as $item) {
            if ($item->variant_id) {
                ProductVariant::where('id', $item->variant_id)
                    ->increment('stock_quantity', $item->quantity);
            } else {
                Product::where('id', $item->product_id)
                    ->increment('stock', $item->quantity);
            }
        }
    }
}
