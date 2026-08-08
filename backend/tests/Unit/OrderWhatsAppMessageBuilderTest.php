<?php

namespace Tests\Unit;

use App\Models\Order;
use App\Services\WhatsApp\OrderWhatsAppMessageBuilder;
use Tests\TestCase;

class OrderWhatsAppMessageBuilderTest extends TestCase
{
    public function test_it_renders_saved_order_details_and_the_secure_invoice_url(): void
    {
        $order = new Order([
            'order_number' => 'LX-TEST-1',
            'customer_name' => "Amina\n",
            'subtotal' => '199.50',
            'discount_amount' => '0.00',
            'shipping_cost' => '0.00',
            'total' => '199.50',
            'payment_method' => 'cash_on_delivery',
            'payment_status' => 'pending',
            'shipping_address' => '1 rue Bloom',
            'shipping_city' => 'Rabat',
        ]);
        $order->setRelation('items', collect([(object) [
            'product_name' => 'Musc', 'size_label' => '50ml', 'quantity' => 2, 'unit_price' => 99.75,
        ]]));

        $message = (new OrderWhatsAppMessageBuilder)->build($order, 'https://mybloom.test/invoice?signature=secret');

        $this->assertStringContainsString('Musc - 50ml | 2 x 99.75 MAD = 199.50 MAD', $message);
        $this->assertStringContainsString('199.50 MAD', $message);
        $this->assertStringContainsString('https://mybloom.test/invoice?signature=secret', $message);
    }
}
