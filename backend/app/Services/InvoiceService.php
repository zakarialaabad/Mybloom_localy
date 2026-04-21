<?php

namespace App\Services;

use App\Models\Order;
use Barryvdh\DomPDF\Facade\Pdf;

class InvoiceService
{
    /**
     * Generate a PDF invoice for the given order and return raw binary content.
     */
    public function generatePdf(Order $order): string
    {
        // Ensure all necessary relations are loaded
        $order->loadMissing(['items.product.images', 'items.product.productType', 'shippingMethod', 'coupon']);

        try {
            $pdf = Pdf::loadView('invoices.order', ['order' => $order])
                ->setPaper('a4', 'portrait');

            return $pdf->output();
        } catch (\Throwable $e) {
            \Log::error('PDF generation failed in InvoiceService: ' . $e->getMessage(), [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'exception' => $e,
            ]);
            throw $e;
        }
    }
}
