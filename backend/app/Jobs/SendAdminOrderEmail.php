<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\GmailService;
use App\Services\InvoiceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendAdminOrderEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Number of seconds to wait before retrying.
     */
    public int $backoff = 30;

    public function __construct(private readonly string $orderNumber) {}

    /**
     * Execute the job.
     * Triggered immediately after an order is successfully stored in the DB.
     */
    public function handle(GmailService $gmailService, InvoiceService $invoiceService): void
    {
        // Load full order with all relations needed for email + invoice
        $order = Order::with(['items.product.images', 'items.product.productType', 'shippingMethod', 'coupon'])
            ->where('order_number', $this->orderNumber)
            ->first();

        if (! $order) {
            Log::warning("SendAdminOrderEmail: Order {$this->orderNumber} not found.");
            return;
        }

        $adminEmail = config('mail.admin_email', 'Bloomparfums1@gmail.com');

        if (! $adminEmail) {
            Log::error('SendAdminOrderEmail: MAIL_ADMIN_EMAIL not configured in .env');
            return;
        }

        // ── 1. Generate PDF invoice (reuses existing InvoiceService) ──────────
        $pdfContent  = null;
        $pdfFilename = null;

        try {
            $pdfContent  = $invoiceService->generatePdf($order);
            $pdfFilename = "invoice-{$order->order_number}.pdf";
        } catch (\Throwable $e) {
            Log::warning("SendAdminOrderEmail: PDF generation failed for {$order->order_number}: {$e->getMessage()}");
            // Continue sending email without PDF if generation fails
        }

        // ── 2. Build HTML email body ───────────────────────────────────────────
        $isHighValue = (float) $order->total > 2000;
        $htmlBody    = $this->buildEmailHtml($order, $isHighValue);

        // ── 3. Compose subject ────────────────────────────────────────────────
        $urgentTag = $isHighValue ? '🔥 [HIGH VALUE] ' : '';
        $subject   = "{$urgentTag}🧾 New Order Received - #{$order->order_number}";

        // ── 4. Send via Gmail API ─────────────────────────────────────────────
        try {
            $gmailService->sendEmail(
                to:          $adminEmail,
                subject:     $subject,
                htmlBody:    $htmlBody,
                pdfContent:  $pdfContent,
                pdfFilename: $pdfFilename,
            );

            Log::info("SendAdminOrderEmail: Email sent to {$adminEmail} for order {$order->order_number}.");
        } catch (\Throwable $e) {
            Log::error("SendAdminOrderEmail: Failed to send email for {$order->order_number}: {$e->getMessage()}");
            throw $e; // Re-throw so the job retries
        }
    }

    /**
     * Build the HTML email body with the full invoice inline.
     */
    private function buildEmailHtml(Order $order, bool $isHighValue): string
    {
        $storeName   = config('app.name', 'Parfum Store');
        $highValueBanner = $isHighValue
            ? '<div style="background:#dc2626;color:#fff;padding:12px 20px;border-radius:6px;margin-bottom:20px;font-weight:bold;font-size:15px;">
                 🔥 HIGH VALUE ORDER — Total exceeds 2,000 DH. Prioritize fulfillment.
               </div>'
            : '';

        // Build order items rows
        $itemsHtml = '';
        foreach ($order->items as $item) {
            $productName = $item->product->name ?? 'Unknown Product';
            $sizeLabel   = $item->size_label ? " ({$item->size_label})" : '';
            $productType = $item->product?->productType?->name ?? '';
            $typeHtml    = $productType ? "<br><span style='font-size:11px;color:#999;'>{$productType}</span>" : '';
            $subtotal    = number_format((float) $item->unit_price * $item->quantity, 2);
            $unitPrice   = number_format((float) $item->unit_price, 2);

            $itemsHtml .= "
            <tr>
              <td style='padding:10px 8px;border-bottom:1px solid #f0f0f0;font-size:14px;color:#333;'>
                {$productName}{$sizeLabel}{$typeHtml}
              </td>
              <td style='padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:center;font-size:14px;color:#555;'>
                {$item->quantity}
              </td>
              <td style='padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;color:#555;'>
                {$unitPrice} DH
              </td>
              <td style='padding:10px 8px;border-bottom:1px solid #f0f0f0;text-align:right;font-size:14px;font-weight:600;color:#111;'>
                {$subtotal} DH
              </td>
            </tr>";
        }

        // Delivery address
        $address = implode(', ', array_filter([
            $order->shipping_address,
            $order->shipping_city,
            $order->shipping_province,
            $order->shipping_postal_code,
        ]));

        // Coupon row (if used)
        $couponRow = '';
        if ($order->discount_amount > 0) {
            $couponCode    = $order->coupon?->code ?? 'COUPON';
            $discountFmt   = number_format((float) $order->discount_amount, 2);
            $couponRow     = "
            <tr>
              <td colspan='2' style='padding:6px 8px;font-size:13px;color:#888;'>
                Discount ({$couponCode})
              </td>
              <td style='padding:6px 8px;text-align:right;font-size:13px;color:#e11d48;'>
                - {$discountFmt} DH
              </td>
            </tr>";
        }

        $subtotalFmt  = number_format((float) $order->subtotal, 2);
        $shippingFmt  = (float) $order->shipping_cost === 0.0 
            ? 'Gratuit (0 DH)' 
            : number_format((float) $order->shipping_cost, 2) . ' DH';
        $totalFmt     = number_format((float) $order->total, 2);
        $shippingName = $order->shippingMethod?->name ?? 'Standard';
        $orderDate    = $order->created_at->format('d/m/Y à H:i');
        $customerEmail = $order->customer_email ?? '—';

        return <<<HTML
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Order - {$order->order_number}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#4a403a;padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">
                {$storeName}
              </h1>
              <p style="margin:4px 0 0;color:#d6c9bf;font-size:13px;">
                New Order Notification
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:28px 32px;">

              {$highValueBanner}

              <p style="margin:0 0 20px;font-size:15px;color:#444;line-height:1.6;">
                Hello Admin,<br>
                A new order has been placed on <strong>{$storeName}</strong> and is awaiting your action.
              </p>

              <!-- Order Meta -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f8;border:1px solid #e8e0d8;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="font-size:13px;color:#888;padding-bottom:6px;">Order ID</td>
                        <td style="font-size:14px;font-weight:700;color:#111;text-align:right;padding-bottom:6px;">
                          #{$order->order_number}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#888;padding-bottom:6px;">Date</td>
                        <td style="font-size:14px;color:#333;text-align:right;padding-bottom:6px;">
                          {$orderDate}
                        </td>
                      </tr>
                      <tr>
                        <td style="font-size:13px;color:#888;">Status</td>
                        <td style="text-align:right;">
                          <span style="background:#fef3c7;color:#92400e;padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">
                            PENDING
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Customer Info -->
              <h3 style="margin:0 0 12px;font-size:15px;color:#4a403a;border-bottom:2px solid #f0e8df;padding-bottom:8px;">
                Customer Information
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Full Name</td>
                  <td style="font-size:14px;color:#111;font-weight:600;text-align:right;padding:4px 0;">
                    {$order->customer_name}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Phone</td>
                  <td style="font-size:14px;color:#111;text-align:right;padding:4px 0;">
                    {$order->customer_phone}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;">Email</td>
                  <td style="font-size:14px;color:#111;text-align:right;padding:4px 0;">
                    {$customerEmail}
                  </td>
                </tr>
                <tr>
                  <td style="font-size:13px;color:#888;padding:4px 0;vertical-align:top;">Delivery Address</td>
                  <td style="font-size:14px;color:#111;text-align:right;padding:4px 0;">
                    {$address}
                  </td>
                </tr>
              </table>

              <!-- Order Items -->
              <h3 style="margin:0 0 12px;font-size:15px;color:#4a403a;border-bottom:2px solid #f0e8df;padding-bottom:8px;">
                Order Items
              </h3>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:20px;">
                <thead>
                  <tr style="background:#f8f5f2;">
                    <th style="padding:10px 8px;text-align:left;font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.5px;">
                      Product
                    </th>
                    <th style="padding:10px 8px;text-align:center;font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.5px;">
                      Qty
                    </th>
                    <th style="padding:10px 8px;text-align:right;font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.5px;">
                      Unit Price
                    </th>
                    <th style="padding:10px 8px;text-align:right;font-size:12px;font-weight:600;color:#888;text-transform:uppercase;letter-spacing:.5px;">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {$itemsHtml}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:2px solid #f0e8df;padding-top:12px;">
                <tr>
                  <td colspan='2' style="padding:6px 8px;font-size:13px;color:#888;">Subtotal</td>
                  <td style="padding:6px 8px;text-align:right;font-size:13px;color:#333;">
                    {$subtotalFmt} DH
                  </td>
                </tr>
                <tr>
                  <td colspan='2' style="padding:6px 8px;font-size:13px;color:#888;">
                    Shipping ({$shippingName})
                  </td>
                  <td style="padding:6px 8px;text-align:right;font-size:13px;color:#333;">
                    {$shippingFmt}
                  </td>
                </tr>
                {$couponRow}
                <tr style="background:#4a403a;border-radius:6px;">
                  <td colspan='2' style="padding:12px 8px;font-size:15px;font-weight:700;color:#fff;">
                    TOTAL
                  </td>
                  <td style="padding:12px 8px;text-align:right;font-size:16px;font-weight:700;color:#fff;">
                    {$totalFmt} DH
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f5f2;padding:18px 32px;border-top:1px solid #ede8e3;">
              <p style="margin:0;font-size:12px;color:#aaa;text-align:center;">
                This is an automated notification from {$storeName}.<br>
                The full PDF invoice is attached to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
HTML;
    }
}
