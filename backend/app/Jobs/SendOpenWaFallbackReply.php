<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Order;
use App\Models\OrderWhatsAppDelivery;
use App\Services\OpenWa\OpenWaClient;
use App\Services\OpenWa\OpenWaException;
use App\Services\WhatsApp\OrderInvoiceLinkService;
use App\Services\WhatsApp\OrderWhatsAppMessageBuilder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class SendOpenWaFallbackReply implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(private readonly int $deliveryId)
    {
        $this->afterCommit();
    }

    public function middleware(): array
    {
        return [(new WithoutOverlapping('openwa-fallback-reply-'.$this->deliveryId))->dontRelease()];
    }

    public function handle(OpenWaClient $openwa, OrderInvoiceLinkService $invoiceLinks, OrderWhatsAppMessageBuilder $messages): void
    {
        $delivery = OrderWhatsAppDelivery::find($this->deliveryId);
        if (! $delivery || ! $this->claim($delivery) || ! $delivery->canonical_chat_id) {
            return;
        }

        $order = Order::with(['items', 'shippingMethod'])->find($delivery->order_id);
        if (! $order) {
            return;
        }

        try {
            $openwa->assertReadyForOwner();
            $invoiceUrl = $delivery->invoice_url && $delivery->invoice_expires_at?->isFuture()
                ? $delivery->invoice_url : $this->renewInvoice($delivery, $order, $invoiceLinks);
            $result = $openwa->sendText($delivery->canonical_chat_id, $messages->build($order, $invoiceUrl));

            if ($result->messageId === null) {
                $this->failReply($delivery, $order, 'message_id_missing', 'OpenWA accepted a fallback reply without a message ID.');

                return;
            }

            // The token is consumed only after a correlation ID exists. As
            // with the automatic message, this is accepted—not delivered.
            $delivery->update([
                'status' => 'fallback_replied',
                'fallback_message_id' => $result->messageId,
                'fallback_used_at' => now(),
                'sent_at' => now(),
                'last_error_code' => null,
                'last_error_message' => null,
            ]);
            Order::whereKey($order->id)->update([
                'whatsapp_confirmation_status' => 'fallback_replied',
                'whatsapp_confirmation_message_id' => $result->messageId,
                'whatsapp_confirmation_sent_at' => now(),
            ]);
        } catch (OpenWaException $exception) {
            if ($exception->retryable && $this->attempts() < $this->tries) {
                $delivery->update(['status' => 'fallback_reply_queued']);
                $this->release($exception->httpStatus === 429 ? 120 : 60);

                return;
            }
            $this->failReply($delivery, $order, $exception->errorCode ?? 'openwa_failure', $exception->getMessage());
        } catch (Throwable $exception) {
            $this->failReply($delivery, $order, 'unexpected_failure', 'The fallback reply outcome could not be verified.');
            Log::error('OpenWA fallback reply failed unexpectedly.', [
                'order_id' => $order->id,
                'order_reference' => $order->order_number,
                'exception' => $exception::class,
            ]);
        }
    }

    private function claim(OrderWhatsAppDelivery $delivery): bool
    {
        return OrderWhatsAppDelivery::whereKey($delivery->id)->where('status', 'fallback_reply_queued')
            ->update(['status' => 'fallback_submitting']) === 1;
    }

    private function renewInvoice(OrderWhatsAppDelivery $delivery, Order $order, OrderInvoiceLinkService $links): string
    {
        $link = $links->create($order);
        $delivery->update(['invoice_url' => $link->url, 'invoice_expires_at' => $link->expiresAt]);

        return $link->url;
    }

    private function failReply(OrderWhatsAppDelivery $delivery, Order $order, string $code, string $message): void
    {
        // Do not consume the claim token: the customer may send it again
        // after the local sender session has recovered.
        $delivery->update([
            'status' => 'customer_action_required',
            'failed_at' => now(),
            'fallback_available_at' => now(),
            'last_error_code' => $code,
            'last_error_message' => 'Customer-initiated WhatsApp reply could not be completed.',
        ]);
        Order::whereKey($order->id)->update([
            'whatsapp_confirmation_status' => 'customer_action_required',
            'whatsapp_confirmation_failed_at' => now(),
            'whatsapp_confirmation_error' => $code,
        ]);
        Log::warning('OpenWA fallback reply was not completed.', [
            'order_id' => $order->id,
            'order_reference' => $order->order_number,
            'failure_code' => $code,
        ]);
    }
}
