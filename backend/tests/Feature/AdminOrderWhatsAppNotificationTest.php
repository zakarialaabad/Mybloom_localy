<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Jobs\ProcessOpenWaWebhook;
use App\Jobs\SendAdminOrderWhatsAppNotification;
use App\Models\AdminOrderWhatsAppNotification;
use App\Models\OpenWaWebhookEvent;
use App\Models\Order;
use App\Services\OpenWa\OpenWaClient;
use App\Services\WhatsApp\AdminOrderWhatsAppMessageBuilder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AdminOrderWhatsAppNotificationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::flush();
        config()->set('services.openwa.enabled', true);
        config()->set('services.openwa.base_url', 'http://openwa.test/api');
        config()->set('services.openwa.api_key', 'test-key');
        config()->set('services.openwa.session_id', 'mybloom-owner');
        config()->set('services.openwa.owner_e164', '212639760141');
        config()->set('services.openwa.admin_recipient_e164', '212611955060');
    }

    public function test_it_sends_saved_order_details_only_to_the_fixed_admin_and_records_openwa_acceptance(): void
    {
        $order = $this->order();
        $order->items()->create(['product_name' => 'Rose Absolue', 'quantity' => 2, 'unit_price' => 50, 'size_label' => '50 ml']);
        $notification = AdminOrderWhatsAppNotification::create(['order_id' => $order->id, 'recipient_e164' => '212611955060']);

        Http::fake([
            'http://openwa.test/api/sessions/mybloom-owner' => Http::response(['status' => 'ready', 'phone' => '+212639760141']),
            'http://openwa.test/api/sessions/mybloom-owner/contacts/check/212611955060' => Http::response(['exists' => true, 'whatsappId' => '212611955060@c.us']),
            'http://openwa.test/api/sessions/mybloom-owner/messages/send-text' => Http::response(['messageId' => 'admin-outbound-1'], 201),
        ]);

        $job = new SendAdminOrderWhatsAppNotification($order->id);
        $job->handle(app(OpenWaClient::class), app(AdminOrderWhatsAppMessageBuilder::class));

        $this->assertSame('accepted', $notification->fresh()->status);
        $this->assertSame('admin-outbound-1', $notification->fresh()->message_id);
        $this->assertSame('212611955060@c.us', $notification->fresh()->canonical_chat_id);
        Http::assertSent(fn ($request) => $request->url() === 'http://openwa.test/api/sessions/mybloom-owner/messages/send-text'
            && $request['chatId'] === '212611955060@c.us'
            && str_contains($request['text'], '#'.$order->order_number)
            && str_contains($request['text'], 'Rose Absolue')
            && ! str_contains($request['chatId'], $order->customer_phone));

        // A duplicate dispatch sees the persisted accepted state and sends no
        // second WhatsApp message.
        $job->handle(app(OpenWaClient::class), app(AdminOrderWhatsAppMessageBuilder::class));
        Http::assertSentCount(3);
    }

    public function test_openwa_failure_marks_only_the_admin_notification_and_never_removes_the_order(): void
    {
        $order = $this->order();
        $notification = AdminOrderWhatsAppNotification::create(['order_id' => $order->id, 'recipient_e164' => '212611955060']);
        config()->set('services.openwa.enabled', false);

        (new SendAdminOrderWhatsAppNotification($order->id))->handle(
            app(OpenWaClient::class), app(AdminOrderWhatsAppMessageBuilder::class),
        );

        $this->assertDatabaseHas('orders', ['id' => $order->id]);
        $this->assertSame('pending', $order->fresh()->status);
        $this->assertSame('failed', $notification->fresh()->status);
        $this->assertSame('provider_not_configured', $notification->fresh()->last_error_code);
    }

    public function test_admin_delivery_acknowledgements_are_tracked_without_changing_the_order(): void
    {
        $order = $this->order();
        $notification = AdminOrderWhatsAppNotification::create([
            'order_id' => $order->id,
            'recipient_e164' => '212611955060',
            'status' => 'accepted',
            'message_id' => 'admin-ack-1',
        ]);
        $event = OpenWaWebhookEvent::create([
            'event_key' => 'admin-ack-1-delivered',
            'event_type' => 'message.ack',
            'payload' => ['data' => ['id' => 'admin-ack-1', 'status' => 'delivered']],
        ]);

        (new ProcessOpenWaWebhook($event->id))->handle();

        $this->assertSame('delivered', $notification->fresh()->status);
        $this->assertSame('pending', $order->fresh()->status);
    }

    private function order(): Order
    {
        return Order::create([
            'customer_name' => 'Amina',
            'customer_phone' => '212720356971',
            'shipping_address' => '1 rue Bloom',
            'shipping_city' => 'Rabat',
            'subtotal' => 100,
            'discount_amount' => 0,
            'shipping_cost' => 30,
            'total' => 130,
            'status' => 'pending',
            'payment_method' => 'cash_on_delivery',
            'payment_status' => 'pending',
        ]);
    }
}
