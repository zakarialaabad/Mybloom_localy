<?php

namespace App\Services;

use App\Models\Order;
use ArPHP\I18N\Arabic;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceService
{
    /**
     * Returns true if the string contains Arabic characters.
     */
    private function isArabic(string $text): bool
    {
        return (bool) preg_match('/[\x{0600}-\x{06FF}]/u', $text);
    }

    /**
     * Reshape and reverse Arabic text so DomPDF renders it correctly.
     * DomPDF has no built-in Arabic shaper, so we must pre-process the text.
     */
    private function reshapeArabic(string $text): string
    {
        if (! $this->isArabic($text)) {
            return $text;
        }

        $arabic = new Arabic;
        $p = $arabic->arIdentify($text);

        for ($i = count($p) - 1; $i >= 0; $i -= 2) {
            $arabicSegment = substr($text, $p[$i - 1], $p[$i] - $p[$i - 1]);
            $shaped = $arabic->utf8Glyphs($arabicSegment);
            $text = substr_replace($text, $shaped, $p[$i - 1], $p[$i] - $p[$i - 1]);
        }

        return $text;
    }

    /**
     * Generate a PDF invoice for the given order and return raw binary content.
     * Supports multilingual content including Arabic with proper UTF-8 encoding.
     */
    public function generatePdf(Order $order): string
    {
        // Ensure all necessary relations are loaded
        $order->loadMissing(['items.product.images', 'items.product.productType', 'shippingMethod', 'coupon']);

        try {
            // Pre-shape Arabic text in all fields that appear in the invoice
            $shapedItems = $order->items->map(function ($item) {
                $clone = clone $item;
                $clone->product_name = $this->reshapeArabic($item->product_name ?? '');

                if ($item->product) {
                    $clone->product = clone $item->product;
                    $clone->product->name = $this->reshapeArabic($item->product->name ?? '');
                }

                return $clone;
            });

            $shapedOrder = clone $order;
            $shapedOrder->customer_name = $this->reshapeArabic($order->customer_name ?? '');
            $shapedOrder->shipping_address_full = $this->reshapeArabic(
                $order->shipping_address_full ?? $order->shipping_address ?? ''
            );
            // Keep original items relation accessible but replace with shaped version
            $shapedOrder->setRelation('items', $shapedItems);

            $pdf = Pdf::loadView('invoices.order', ['order' => $shapedOrder])
                ->setPaper('a4', 'portrait')
                ->setOptions([
                    'isPhpEnabled' => false,
                    'isRemoteEnabled' => false,
                    'isFontSubsettingEnabled' => true,
                    'defaultFont' => 'dejavu sans',
                ]);

            return $pdf->output();
        } catch (\Throwable $e) {
            \Log::error('PDF generation failed in InvoiceService: '.$e->getMessage(), [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'exception' => $e,
            ]);
            throw $e;
        }
    }
}
