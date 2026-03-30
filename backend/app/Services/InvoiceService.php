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
        $order->loadMissing(['items.product', 'shippingMethod']);

        $pdf = Pdf::loadView('invoices.order', ['order' => $order])
            ->setPaper('a4', 'portrait');

        return $pdf->output();
    }
}
