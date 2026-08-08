<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\AdminOrderWhatsAppNotification;
use App\Models\OpenWaWebhookEvent;
use App\Models\Order;
use App\Models\OrderWhatsAppDelivery;
use App\Support\WhatsAppPhone;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ProcessOpenWaWebhook implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private readonly int $eventId) {}

    public function handle(): void
    {
        $event = OpenWaWebhookEvent::find($this->eventId);
        if (! $event || $event->processed_at) {
            return;
        }

        $payload = $event->payload;
        $data = is_array($payload['data'] ?? null) ? $payload['data'] : $payload;

        match ($event->event_type) {
            'message.ack', 'message.failed' => $this->ack($data, $event->session_id),
            'message.received' => $this->received($data),
            'session.disconnected' => $this->disconnected(),
            default => null,
        };

        $event->update(['processed_at' => now()]);
    }

    private function ack(array $data, ?string $sessionId): void
    {
        // OpenWA v0.13 uses `id` for the WhatsApp message ID. The other keys
        // keep existing installations compatible with older gateway releases.
        $messageId = (string) ($data['id'] ?? $data['messageId'] ?? $data['message_id'] ?? data_get($data, 'message.id') ?? '');
        $status = $this->ackStatus($data);
        if ($messageId === '' || ! in_array($status, ['pending', 'sent', 'delivered', 'read', 'failed'], true)) {
            return;
        }

        $delivery = OrderWhatsAppDelivery::where('message_id', $messageId)
            ->orWhere('fallback_message_id', $messageId)->first();
        if (! $delivery) {
            $this->ackAdminNotification($messageId, $status, $sessionId);

            return;
        }

        // Never downgrade an independently-confirmed device delivery.
        if ($status === 'read' && $delivery->status !== 'read') {
            $delivery->update(['status' => 'read', 'delivered_at' => $delivery->delivered_at ?? now(), 'read_at' => now()]);
        } elseif ($status === 'delivered' && $delivery->status !== 'read') {
            $delivery->update(['status' => 'delivered', 'delivered_at' => $delivery->delivered_at ?? now()]);
        } elseif ($status === 'sent' && in_array($delivery->status, ['accepted', 'sent'], true)) {
            $delivery->update(['status' => 'sent']);
        } elseif ($status === 'failed' && ! in_array($delivery->status, ['delivered', 'read'], true)) {
            $delivery->update([
                'status' => 'failed', 'failed_at' => now(), 'fallback_available_at' => now(),
                'last_error_code' => 'openwa_message_failed',
            ]);
        }

        $this->syncOrder($delivery);
    }

    /**
     * This isolated lifecycle intentionally never updates Order or any
     * customer-delivery row. It only correlates the fixed admin alert's
     * OpenWA message ID with its own persisted status record.
     */
    private function ackAdminNotification(string $messageId, string $status, ?string $sessionId): void
    {
        if ($sessionId !== null && $sessionId !== '' && ! hash_equals((string) config('services.openwa.session_id'), $sessionId)) {
            Log::warning('Ignoring admin WhatsApp acknowledgement from an unexpected OpenWA session.', [
                'session_id' => $sessionId,
                'message_id' => $messageId,
            ]);

            return;
        }

        $notification = AdminOrderWhatsAppNotification::where('message_id', $messageId)->first();
        if (! $notification) {
            return;
        }

        if ($status === 'read' && $notification->status !== 'read') {
            $notification->update([
                'status' => 'read',
                'delivered_at' => $notification->delivered_at ?? now(),
                'read_at' => now(),
            ]);
        } elseif ($status === 'delivered' && $notification->status !== 'read') {
            $notification->update([
                'status' => 'delivered',
                'delivered_at' => $notification->delivered_at ?? now(),
            ]);
        } elseif ($status === 'sent' && in_array($notification->status, ['accepted', 'sent'], true)) {
            $notification->update(['status' => 'sent']);
        } elseif ($status === 'failed' && ! in_array($notification->status, ['delivered', 'read'], true)) {
            $notification->update([
                'status' => 'failed',
                'failed_at' => now(),
                'last_error_code' => 'openwa_message_failed',
            ]);
        }
    }

    private function received(array $data): void
    {
        if ((bool) ($data['fromMe'] ?? data_get($data, 'message.fromMe') ?? false)) {
            return;
        }

        // In the installed OpenWA contract, `from` is the sender's canonical
        // JID and `body` contains the text. No contacts lookup is involved.
        $chatId = (string) ($data['chatId'] ?? $data['from'] ?? data_get($data, 'chat.id') ?? data_get($data, 'message.chatId') ?? '');
        $text = trim((string) ($data['body'] ?? $data['text'] ?? data_get($data, 'message.body') ?? data_get($data, 'message.text') ?? ''));
        if ($chatId === '' || $text === '' || str_contains($chatId, '@g.us') || str_contains($chatId, '@status')) {
            return;
        }
        if (! preg_match('/^CONFIRM\s+([A-Z0-9-]+)\s+([A-F0-9]{16})$/i', $text, $match)) {
            return;
        }

        $sender = $this->senderDigits((string) ($data['senderPhone'] ?? $data['from'] ?? data_get($data, 'sender.phone') ?? ''));
        if ($sender === null || hash_equals((string) config('services.openwa.owner_e164'), $sender)) {
            return;
        }

        DB::transaction(function () use ($match, $sender, $chatId): void {
            $delivery = OrderWhatsAppDelivery::whereHas('order', fn ($query) => $query->where('order_number', $match[1]))
                ->lockForUpdate()->first();
            if (! $delivery || $delivery->fallback_used_at || ! $delivery->fallback_expires_at?->isFuture()
                || ! is_string($delivery->fallback_token_hash)
                || ! hash_equals($delivery->fallback_token_hash, hash('sha256', strtoupper($match[2])))) {
                return;
            }

            if (! hash_equals($delivery->recipient_e164, $sender)) {
                Log::warning('OpenWA fallback sender did not match the saved order recipient.', [
                    'order_id' => $delivery->order_id,
                    'order_reference' => $delivery->order?->order_number,
                ]);

                return;
            }

            // Persist the one-time claim before dispatching. This prevents a
            // repeated inbound webhook from yielding duplicate order details.
            if (OrderWhatsAppDelivery::whereKey($delivery->id)
                ->whereNotIn('status', ['fallback_reply_queued', 'fallback_submitting', 'fallback_replied'])
                ->update([
                    'status' => 'fallback_reply_queued',
                    'canonical_chat_id' => $chatId,
                    'customer_initiated_at' => now(),
                ]) !== 1) {
                return;
            }

            SendOpenWaFallbackReply::dispatch($delivery->id)->afterCommit();
        });
    }

    private function disconnected(): void
    {
        OrderWhatsAppDelivery::whereIn('status', ['queued', 'checking', 'submitting', 'accepted', 'sent'])
            ->update(['status' => 'unconfirmed', 'fallback_available_at' => now(), 'last_error_code' => 'session_disconnected']);
    }

    private function syncOrder(OrderWhatsAppDelivery $delivery): void
    {
        Order::whereKey($delivery->order_id)->update(['whatsapp_confirmation_status' => $delivery->status]);
    }

    private function ackStatus(array $data): string
    {
        $status = strtolower((string) ($data['status'] ?? ''));
        if ($status !== '') {
            return $status;
        }

        return match ((int) ($data['ack'] ?? -99)) {
            0 => 'pending', 1 => 'sent', 2 => 'delivered', 3 => 'read', -1 => 'failed', default => '',
        };
    }

    private function senderDigits(string $sender): ?string
    {
        // Supports @c.us, @lid, @s.whatsapp.net and device-qualified JIDs.
        $user = explode('@', $sender, 2)[0];
        $user = explode(':', $user, 2)[0];
        try {
            return WhatsAppPhone::normalize($user, null);
        } catch (\InvalidArgumentException) {
            return null;
        }
    }
}
