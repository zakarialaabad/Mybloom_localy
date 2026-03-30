<?php

namespace App\Jobs;

use App\Models\Admin;
use App\Models\Order;
use App\Services\InvoiceService;
use App\Services\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendInvoiceViaWhatsApp implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Max seconds before the job is considered failed.
     */
    public int $timeout = 120;

    /**
     * Number of times to retry on failure.
     */
    public int $tries = 2;

    public function __construct(private readonly string $orderNumber)
    {
    }

    public function handle(InvoiceService $invoiceService, WhatsAppService $whatsAppService): void
    {
        $order = Order::with(['items.product', 'shippingMethod'])
            ->where('order_number', $this->orderNumber)
            ->first();

        if (! $order) {
            Log::warning("SendInvoiceViaWhatsApp: order {$this->orderNumber} not found — skipping.");
            return;
        }

        // ── Generate invoice download link ────────────────────────────────────
        $downloadUrl = config('app.url') . "/api/v1/invoices/{$order->order_number}/download";

        // ── Notify customer ───────────────────────────────────────────────
        if ($order->customer_phone) {
            $customerMessage = "Bonjour {$order->customer_name},\n\n"
                . "Merci pour votre commande #{$order->order_number} ✨\n"
                . "Votre facture est prête à télécharger.\n\n"
                . "Cliquez ici: {$downloadUrl}\n\n"
                . "MyBloom 🌸";

            $result = $whatsAppService->sendText($order->customer_phone, $customerMessage);
            Log::info("SendInvoiceViaWhatsApp: customer [{$order->customer_phone}]", $result);
        }

        // ── Notify admin ──────────────────────────────────────────────────
        $adminPhone = Admin::whereNotNull('phone')->value('phone');
        if ($adminPhone) {
            $adminMessage = "📦 Nouvelle commande #{$order->order_number}\n\n"
                . "Client: {$order->customer_name}\n"
                . "Téléphone: {$order->customer_phone}\n"
                . "Total: {$order->total} DH\n\n"
                . "Facture: {$downloadUrl}";

            $result = $whatsAppService->sendText($adminPhone, $adminMessage);
            Log::info("SendInvoiceViaWhatsApp: admin [{$adminPhone}]", $result);
        }
    }

    public function failed(\Throwable $exception): void
    {
        Log::error("SendInvoiceViaWhatsApp: job failed for order {$this->orderNumber}", [
            'error' => $exception->getMessage(),
        ]);
    }
}
