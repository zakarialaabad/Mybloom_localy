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
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

class SendOrderWhatsAppConfirmation implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 2;

    public function __construct(private readonly int $orderId)
    {
        $this->afterCommit();
    }

    public function middleware(): array
    {
        return [(new WithoutOverlapping('openwa-order-confirmation-'.$this->orderId))->dontRelease()];
    }

    public function handle(OpenWaClient $openwa, OrderInvoiceLinkService $invoiceLinks, OrderWhatsAppMessageBuilder $messages): void
    {
        $order = Order::with(['items', 'shippingMethod'])->find($this->orderId);
        if (! $order) {
            return;
        }

        $delivery = OrderWhatsAppDelivery::query()->where('order_id', $order->id)
            ->where('purpose', OrderWhatsAppDelivery::PURPOSE_CONFIRMATION)->first();
        if (! $delivery || ! $this->claim($delivery)) {
            return;
        }

        try {
            $openwa->assertReadyForOwner();
            $contact = $openwa->checkCustomerNumber($delivery->recipient_e164);
            if ($contact === null) {
                $this->finish($delivery, $order, 'number_not_on_whatsapp', 'number_not_on_whatsapp', 'The number is not registered on WhatsApp.');

                return;
            }

            $delivery->update(['canonical_chat_id' => $contact['whatsappId'], 'status' => 'submitting']);
            $invoiceUrl = $this->invoiceUrl($delivery, $order, $invoiceLinks);
            $result = $openwa->sendText($contact['whatsappId'], $messages->build($order, $invoiceUrl));

            if ($result->messageId === null) {
                // The gateway accepted an ambiguous response but it cannot be
                // correlated to a later acknowledgement, so never resend.
                $this->finish($delivery, $order, 'unconfirmed', 'message_id_missing', 'OpenWA accepted a response without a message ID.');

                return;
            }

            $delivery->update([
                // HTTP 201 means OpenWA accepted the message. It is not
                // device delivery; only a later delivered/read ACK can prove
                // that outcome.
                'status' => 'accepted', 'message_id' => $result->messageId, 'sent_at' => now(),
                'last_error_code' => null, 'last_error_message' => null,
            ]);
            $this->syncOrder($order, 'accepted', $result->messageId);
            MarkOpenWaDeliveryUnconfirmed::dispatch($delivery->id)
                ->delay(now()->addSeconds((int) config('services.openwa.auto_ack_timeout_seconds')));
        } catch (OpenWaException $e) {
            $this->handleOpenWaException($delivery, $order, $e);
        } catch (Throwable) {
            // An exception after a network send might be ambiguous. Do not retry.
            $this->finish($delivery, $order, 'unconfirmed', 'unexpected_failure', 'The confirmation outcome could not be verified.');
        }
    }

    private function claim(OrderWhatsAppDelivery $delivery): bool
    {
        return OrderWhatsAppDelivery::whereKey($delivery->id)->where('status', 'queued')->update([
            'status' => 'checking', 'auto_attempted_at' => now(), 'attempt_count' => DB::raw('attempt_count + 1'),
        ]) === 1;
    }

    private function invoiceUrl(OrderWhatsAppDelivery $delivery, Order $order, OrderInvoiceLinkService $links): string
    {
        if ($delivery->invoice_url && $delivery->invoice_expires_at?->isFuture()) {
            return $delivery->invoice_url;
        }
        $link = $links->create($order);
        $delivery->update(['invoice_url' => $link->url, 'invoice_expires_at' => $link->expiresAt]);

        return $link->url;
    }

    private function handleOpenWaException(OrderWhatsAppDelivery $delivery, Order $order, OpenWaException $e): void
    {
        if ($e->retryable && $this->attempts() < $this->tries && (
            $e->httpStatus === null || in_array($e->httpStatus, [409, 429], true) || $e->httpStatus >= 500
        )) {
            $delivery->update(['status' => 'queued', 'last_error_code' => $e->errorCode, 'last_error_message' => 'OpenWA is temporarily unavailable.']);
            $this->release($e->httpStatus === 429 ? 120 : 60);

            return;
        }
        $status = $e->errorCode === 'connection_unknown' ? 'unconfirmed' : 'failed';
        $this->finish($delivery, $order, $status, $e->errorCode ?? 'openwa_failure', $e->getMessage());
    }

    private function finish(OrderWhatsAppDelivery $delivery, Order $order, string $status, string $code, string $message): void
    {
        $delivery->update([
            'status' => $status, 'fallback_available_at' => now(), 'failed_at' => now(), 'last_error_code' => Str::limit($code, 100, ''),
            'last_error_message' => Str::limit($this->redact($message), 500, ''),
        ]);
        $this->syncOrder($order, $status, null, $code);
        Log::warning('OpenWA order confirmation was not completed.', [
            'order_id' => $order->id,
            'order_reference' => $order->order_number,
            'notification_status' => $status,
            'failure_code' => $code,
        ]);
    }

    private function syncOrder(Order $order, string $status, ?string $messageId = null, ?string $error = null): void
    {
        $fields = ['whatsapp_confirmation_status' => $status, 'whatsapp_confirmation_error' => $error];
        if ($messageId) {
            $fields += ['whatsapp_confirmation_message_id' => $messageId, 'whatsapp_confirmation_sent_at' => now()];
        }
        if (in_array($status, ['failed', 'unconfirmed', 'number_not_on_whatsapp'], true)) {
            $fields['whatsapp_confirmation_failed_at'] = now();
        }
        Order::whereKey($order->id)->update($fields);
    }

    private function redact(string $message): string
    {
        foreach (['api_key', 'webhook_secret'] as $key) {
            if (($secret = (string) config('services.openwa.'.$key)) !== '') {
                $message = str_replace($secret, '[redacted]', $message);
            }
        }

        return preg_replace('/\+?[1-9][0-9]{7,14}\b/', '[phone]', $message) ?? $message;
    }
}
