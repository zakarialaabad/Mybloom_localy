<?php

namespace Tests\Feature;

use App\Jobs\ProcessOpenWaWebhook;
use App\Jobs\SendOpenWaFallbackReply;
use App\Jobs\SendOrderWhatsAppConfirmation;
use App\Models\OpenWaWebhookEvent;
use App\Models\Order;
use App\Models\OrderWhatsAppDelivery;
use App\Services\OpenWa\OpenWaClient;
use App\Services\WhatsApp\OrderInvoiceLinkService;
use App\Services\WhatsApp\OrderWhatsAppMessageBuilder;
use App\Support\WhatsAppPhone;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class OpenWaOrderWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        config()->set('services.openwa.enabled', true);
        config()->set('services.openwa.base_url', 'http://openwa.test/api');
        config()->set('services.openwa.api_key', 'test-key');
        config()->set('services.openwa.session_id', 'mybloom-owner');
        config()->set('services.openwa.owner_e164', '212639760141');
        config()->set('services.openwa.invoice_public_url', 'https://mybloom.test');
    }

    public function test_openwa_acceptance_is_submitted_and_uses_the_returned_canonical_id(): void
    {
        Queue::fake();
        $order = $this->order();
        $delivery = $this->delivery($order);
        Http::fake([
            'http://openwa.test/api/sessions/mybloom-owner' => Http::response(['status' => 'ready', 'phone' => '+212639760141']),
            'http://openwa.test/api/sessions/mybloom-owner/contacts/check/212720356971' => Http::response(['isRegistered' => true, 'whatsappId' => 'new-contact@lid']),
            'http://openwa.test/api/sessions/mybloom-owner/messages/send-text' => Http::response(['messageId' => 'outbound-1'], 201),
        ]);
        (new SendOrderWhatsAppConfirmation($order->id))->handle(app(OpenWaClient::class), app(OrderInvoiceLinkService::class), app(OrderWhatsAppMessageBuilder::class));
        $delivery->refresh();
        $this->assertSame('accepted', $delivery->status);
        $this->assertSame('new-contact@lid', $delivery->canonical_chat_id);
        $this->assertSame('outbound-1', $delivery->message_id);
        Http::assertSent(fn ($request) => $request->url() === 'http://openwa.test/api/sessions/mybloom-owner/messages/send-text' && $request['chatId'] === 'new-contact@lid');
    }

    public function test_invalid_webhook_signature_is_rejected(): void
    {
        config()->set('services.openwa.webhook_secret', 'webhook-secret');
        $this->withHeader('X-OpenWA-Signature', 'wrong')->postJson('/api/v1/webhooks/openwa', ['event' => 'message.ack'])->assertUnauthorized();
    }

    public function test_openwa_prefixed_raw_body_signature_is_accepted_once(): void
    {
        Queue::fake();
        config()->set('services.openwa.webhook_secret', 'webhook-secret');
        $raw = json_encode([
            'event' => 'message.ack', 'sessionId' => 'mybloom-owner',
            'idempotencyKey' => 'gateway-delivery-1', 'data' => ['messageId' => 'x', 'status' => 'sent'],
        ], JSON_THROW_ON_ERROR);
        $signature = 'sha256='.hash_hmac('sha256', $raw, 'webhook-secret');

        $this->call('POST', '/api/v1/webhooks/openwa', [], [], [], [
            'CONTENT_TYPE' => 'application/json', 'HTTP_X_OPENWA_SIGNATURE' => $signature,
        ], $raw)->assertAccepted()->assertJsonPath('duplicate', false);

        $this->call('POST', '/api/v1/webhooks/openwa', [], [], [], [
            'CONTENT_TYPE' => 'application/json', 'HTTP_X_OPENWA_SIGNATURE' => $signature,
        ], $raw)->assertAccepted()->assertJsonPath('duplicate', true);
        $this->assertDatabaseCount('openwa_webhook_events', 1);
        Queue::assertPushed(ProcessOpenWaWebhook::class, 1);
    }

    public function test_moroccan_checkout_formats_normalize_to_e164_digits(): void
    {
        foreach (['0720356971', '07 20 35 69 71', '+212 720-356971', '00212720356971', '212720356971', '720356971'] as $input) {
            $this->assertSame('212720356971', WhatsAppPhone::normalizeMoroccan($input));
        }
    }

    public function test_confirmation_message_uses_saved_item_prices_totals_and_invoice_url(): void
    {
        $order = $this->order();
        $order->items()->create([
            'product_name' => 'Rose Absolue', 'quantity' => 2, 'unit_price' => 50, 'size_label' => '50 ml',
        ]);
        $message = app(OrderWhatsAppMessageBuilder::class)->build($order, 'https://mybloom.test/signed-invoice');

        $this->assertStringContainsString('Rose Absolue - 50 ml | 2 x 50.00 MAD = 100.00 MAD', $message);
        $this->assertStringContainsString('Sous-total : 100.00 MAD', $message);
        $this->assertStringContainsString('Statut du paiement : pending', $message);
        $this->assertStringContainsString('https://mybloom.test/signed-invoice', $message);
    }

    public function test_acknowledgements_are_monotonic_and_only_delivered_or_read_confirm_delivery(): void
    {
        $order = $this->order();
        $delivery = $this->delivery($order);
        $delivery->update(['status' => 'accepted', 'message_id' => 'outbound-ack']);
        $this->processAck('outbound-ack', 'delivered');
        $this->assertSame('delivered', $delivery->fresh()->status);
        $this->processAck('outbound-ack', 'read');
        $this->processAck('outbound-ack', 'sent');
        $this->assertSame('read', $delivery->fresh()->status);
    }

    public function test_matching_customer_claim_from_the_real_openwa_envelope_queues_one_fallback_reply(): void
    {
        Queue::fake();
        $order = $this->order();
        $delivery = $this->delivery($order);
        Http::fake([
            'http://openwa.test/api/sessions/mybloom-owner' => Http::response(['status' => 'ready', 'phone' => '+212639760141']),
            'http://openwa.test/api/sessions/mybloom-owner/messages/send-text' => Http::response(['messageId' => 'fallback-1'], 201),
        ]);
        $event = OpenWaWebhookEvent::create([
            'event_key' => 'inbound-claim', 'event_type' => 'message.received', 'payload' => ['data' => [
                'id' => 'inbound-1', 'from' => '212720356971@c.us',
                'body' => 'CONFIRM '.$order->order_number.' ABCDEF0123456789',
            ]],
        ]);
        (new ProcessOpenWaWebhook($event->id))->handle();
        Queue::assertPushed(SendOpenWaFallbackReply::class, 1);
        $this->assertSame('fallback_reply_queued', $delivery->fresh()->status);

        (new SendOpenWaFallbackReply($delivery->id))->handle(
            app(OpenWaClient::class), app(OrderInvoiceLinkService::class), app(OrderWhatsAppMessageBuilder::class),
        );
        $delivery->refresh();
        $this->assertSame('fallback_replied', $delivery->status);
        $this->assertSame('fallback-1', $delivery->fallback_message_id);
        $this->assertNotNull($delivery->fallback_used_at);
    }

    private function processAck(string $messageId, string $status): void
    {
        $event = OpenWaWebhookEvent::create([
            'event_key' => $messageId.'-'.$status, 'event_type' => 'message.ack',
            'payload' => ['data' => ['id' => $messageId, 'status' => $status]],
        ]);
        (new ProcessOpenWaWebhook($event->id))->handle();
    }

    private function order(): Order
    {
        return Order::create([
            'customer_name' => 'Amina', 'customer_phone' => '212720356971', 'shipping_address' => '1 rue Bloom',
            'shipping_city' => 'Rabat', 'subtotal' => 100, 'discount_amount' => 0, 'shipping_cost' => 0,
            'total' => 100, 'status' => 'pending', 'payment_method' => 'cash_on_delivery', 'payment_status' => 'pending',
            'whatsapp_confirmation_requested' => true, 'whatsapp_consent_at' => now(), 'whatsapp_consent_source' => 'checkout',
        ]);
    }

    private function delivery(Order $order): OrderWhatsAppDelivery
    {
        return OrderWhatsAppDelivery::create([
            'order_id' => $order->id, 'purpose' => 'order_confirmation', 'recipient_original' => '+212 720 356971',
            'recipient_e164' => '212720356971', 'consent_at' => now(), 'status' => 'queued',
            'fallback_token_hash' => hash('sha256', 'ABCDEF0123456789'), 'fallback_expires_at' => now()->addDay(),
        ]);
    }
}
