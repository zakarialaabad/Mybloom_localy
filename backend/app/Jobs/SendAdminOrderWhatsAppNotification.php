<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\AdminOrderWhatsAppNotification;
use App\Models\Order;
use App\Services\OpenWa\OpenWaClient;
use App\Services\OpenWa\OpenWaException;
use App\Services\WhatsApp\AdminOrderWhatsAppMessageBuilder;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\Middleware\WithoutOverlapping;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Throwable;

/**
 * A standalone internal alert. It never changes the order or any customer
 * WhatsApp/invoice record, including when OpenWA is unavailable.
 */
final class SendAdminOrderWhatsAppNotification implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 4;

    public function __construct(private readonly int $orderId)
    {
        $this->afterCommit();
    }

    public function uniqueId(): string
    {
        return 'admin-order-whatsapp:'.$this->orderId;
    }

    public function backoff(): array
    {
        return [10, 30, 90, 180];
    }

    public function middleware(): array
    {
        return [(new WithoutOverlapping($this->uniqueId()))->dontRelease()];
    }

    public function handle(OpenWaClient $openwa, AdminOrderWhatsAppMessageBuilder $messages): void
    {
        $order = Order::with('items')->find($this->orderId);
        if (! $order) {
            return;
        }

        $notification = AdminOrderWhatsAppNotification::where('order_id', $order->id)->first();
        if (! $notification || in_array($notification->status, ['accepted', 'sent', 'delivered', 'read'], true)) {
            return;
        }
        if (! $this->claim($notification)) {
            return;
        }

        try {
            $openwa->assertReadyForAdminSender();
            $recipient = $openwa->resolveAdminRecipient();
            $notification->update([
                'canonical_chat_id' => $recipient['whatsappId'],
                'status' => 'submitting',
            ]);

            $result = $openwa->sendAdminText($recipient['whatsappId'], $messages->build($order));
            if ($result->messageId === null) {
                // The gateway response is ambiguous; sending again could make
                // a duplicate admin alert, so keep it terminal and visible.
                $this->finish($notification, $order, 'failed', 'message_id_missing', 'OpenWA accepted a response without a message ID.');

                return;
            }

            $notification->update([
                // HTTP acceptance is deliberately not marked delivered. A
                // later signed OpenWA acknowledgement advances this status.
                'status' => 'accepted',
                'message_id' => $result->messageId,
                'accepted_at' => now(),
                'last_error_code' => null,
                'last_error_message' => null,
            ]);
        } catch (OpenWaException $e) {
            $this->handleOpenWaException($notification, $order, $e);
        } catch (Throwable $e) {
            // A failure after an uncertain network write must never trigger a
            // second send. Record it for diagnosis without touching the order.
            $this->finish($notification, $order, 'failed', 'unexpected_failure', 'The admin notification outcome could not be verified.');
            Log::warning('Admin order WhatsApp notification failed unexpectedly.', [
                'order_id' => $order->id,
                'order_reference' => $order->order_number,
                'error_type' => $e::class,
            ]);
        }
    }

    private function claim(AdminOrderWhatsAppNotification $notification): bool
    {
        return AdminOrderWhatsAppNotification::whereKey($notification->id)
            ->where('status', 'queued')
            ->update([
                'status' => 'checking',
                'attempted_at' => now(),
                'attempt_count' => DB::raw('attempt_count + 1'),
            ]) === 1;
    }

    private function handleOpenWaException(AdminOrderWhatsAppNotification $notification, Order $order, OpenWaException $e): void
    {
        if ($e->retryable && $this->attempts() < $this->tries) {
            $notification->update([
                'status' => 'queued',
                'last_error_code' => Str::limit((string) $e->errorCode, 100, ''),
                'last_error_message' => 'OpenWA is temporarily unavailable.',
            ]);
            $this->release($e->httpStatus === 429 ? 120 : 60);

            return;
        }

        $this->finish($notification, $order, 'failed', (string) ($e->errorCode ?: 'openwa_failure'), $e->getMessage());
    }

    private function finish(AdminOrderWhatsAppNotification $notification, Order $order, string $status, string $code, string $message): void
    {
        $notification->update([
            'status' => $status,
            'failed_at' => now(),
            'last_error_code' => Str::limit($code, 100, ''),
            'last_error_message' => Str::limit($this->redact($message), 500, ''),
        ]);

        Log::warning('Admin order WhatsApp notification was not completed.', [
            'order_id' => $order->id,
            'order_reference' => $order->order_number,
            'notification_status' => $status,
            'failure_code' => $code,
        ]);
    }

    private function redact(string $message): string
    {
        foreach (['api_key', 'webhook_secret'] as $key) {
            $secret = (string) config('services.openwa.'.$key);
            if ($secret !== '') {
                $message = str_replace($secret, '[redacted]', $message);
            }
        }

        return $message;
    }
}
