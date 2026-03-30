<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Send WhatsApp Notification via Template
 * 
 * Queue job that sends pre-approved WhatsApp template messages
 * to customers and admins when orders are created or updated.
 * 
 * PRODUCTION-READY: 
 * - Uses only Meta-approved templates
 * - Respects opt-in consent
 * - Automatic retry with exponential backoff
 * - Comprehensive logging
 */
class SendWhatsAppNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Max seconds before the job is considered failed
     */
    public int $timeout = 120;

    /**
     * Number of times to retry on failure
     */
    public int $tries = 2;

    /**
     * Backoff delays (seconds) between retries
     */
    public array $backoff = [30, 60];

    /**
     * @param string $orderNumber    Order number
     * @param string $eventType      Event type (order_confirmation, order_shipped, etc.)
     * @param ?string $recipientType Send to 'customer' or 'admin' (null = both)
     */
    public function __construct(
        private readonly string $orderNumber,
        private readonly string $eventType = 'order_confirmation',
        private readonly ?string $recipientType = null,
    ) {
    }

    public function handle(WhatsAppService $whatsAppService): void
    {
        $order = Order::with(['items.product', 'shippingMethod'])
            ->where('order_number', $this->orderNumber)
            ->first();

        if (!$order) {
            Log::warning("SendWhatsAppNotification: order {$this->orderNumber} not found — skipping");
            return;
        }

        // Get template configuration
        $templates = config('whatsapp-templates.templates');
        if (!isset($templates[$this->eventType])) {
            Log::error("SendWhatsAppNotification: template '{$this->eventType}' not configured");
            return;
        }

        $templateConfig = $templates[$this->eventType];
        $templateName = $templateConfig['template_meta_name'];
        $language = $templateConfig['language'] ?? config('whatsapp-templates.default_language');

        // ── Send to Customer ────────────────────────────────────────────
        if (!$this->recipientType || $this->recipientType === 'customer') {
            if ($order->customer_phone && $order->whatsapp_opt_in) {
                $params = $this->buildCustomerParams($order);
                $result = $whatsAppService->sendTemplate(
                    $order->customer_phone,
                    $templateName,
                    $params,
                    $language
                );

                Log::info("SendWhatsAppNotification: customer [{$order->customer_phone}]", [
                    'order_number' => $order->order_number,
                    'event'        => $this->eventType,
                    'ok'           => $result['ok'],
                    'message_id'   => $result['message_id'],
                    'error'        => $result['error'],
                ]);
            } else {
                $reason = !$order->customer_phone ? 'no phone' : 'opted out';
                Log::info("SendWhatsAppNotification: skipping customer — {$reason}", [
                    'order_number' => $order->order_number,
                ]);
            }
        }

        // ── Send to Admin ───────────────────────────────────────────────
        if (!$this->recipientType || $this->recipientType === 'admin') {
            $adminPhone = config('services.whatsapp.admin_phone');
            $adminTemplates = config('services.whatsapp.admin_templates', []);
            $adminTemplate = $adminTemplates[$this->eventType] ?? $templateName;

            if ($adminPhone) {
                $params = $this->buildAdminParams($order);
                $result = $whatsAppService->sendTemplate(
                    $adminPhone,
                    $adminTemplate,
                    $params,
                    $language
                );

                Log::info("SendWhatsAppNotification: admin [{$adminPhone}]", [
                    'order_number' => $order->order_number,
                    'event'        => $this->eventType,
                    'ok'           => $result['ok'],
                    'message_id'   => $result['message_id'],
                    'error'        => $result['error'],
                ]);
            }
        }
    }

    /**
     * Build template parameters for customer message
     */
    private function buildCustomerParams(Order $order): array
    {
        return [
            $order->customer_name,
            $order->order_number,
            number_format($order->total, 2) . ' DH',
        ];
    }

    /**
     * Build template parameters for admin message
     */
    private function buildAdminParams(Order $order): array
    {
        return [
            $order->order_number,
            $order->customer_name,
            number_format($order->total, 2) . ' DH',
            $order->items->count(),
        ];
    }

    /**
     * Handle job failure
     */
    public function failed(\Throwable $exception): void
    {
        Log::error("SendWhatsAppNotification: job failed for order {$this->orderNumber}", [
            'event'      => $this->eventType,
            'error'      => $exception->getMessage(),
            'trace'      => $exception->getTraceAsString(),
        ]);

        // Optionally: Send alert to admin, update order status, etc.
        // whatsAppService->sendAlertToAdmin(...);
    }

    /**
     * Determine the time at which the job should timeout
     */
    public function timeout(): int
    {
        return $this->timeout;
    }
}
