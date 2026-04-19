<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\OrderTrackResource;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\InvoiceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\BinaryFileResponse;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly InvoiceService $invoiceService,
    ) {
    }

    /**
     * POST /api/v1/orders
     * 
     * Create a new order
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->createOrder($request->validated());

        return response()->json([
            'data' => [
                'order_number' => $order->order_number,
                'total'        => (float) $order->total,
            ],
            'message' => 'Order placed successfully.',
        ], 201);
    }

    /**
     * GET /api/v1/orders/{orderNumber}/track?phone=
     */
    public function track(Request $request, string $orderNumber): JsonResponse
    {
        $request->validate([
            'phone' => ['required', 'string'],
        ]);

        $order = Order::with(['items.product.images', 'statusHistories', 'shippingMethod'])
            ->where('order_number', $orderNumber)
            ->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found. Please check your order number and phone.'], 404);
        }

        if (! $this->phonesMatch($request->phone, $order->customer_phone)) {
            return response()->json(['message' => 'Order not found. Please check your order number and phone.'], 404);
        }
        return response()->json(['data' => new OrderTrackResource($order)]);
    }

    /**
     * GET /api/v1/invoices/{orderNumber}/download?phone=
     *
     * Generate and download the PDF invoice for an order.
     * Requires phone verification to prevent unauthorized access (IDOR).
     */
    public function downloadInvoice(Request $request, string $orderNumber)
    {
        $request->validate([
            'phone' => ['required', 'string'],
        ]);

        // Normalize phone to match the format stored in DB (+212XXXXXXXXX).
        // The frontend may send the display value ("07 22 44 33 11") if the
        // session was written before the fix; strip spaces and convert leading 0.
        $rawPhone    = preg_replace('/[\s\-]/', '', $request->phone);
        $normalPhone = preg_replace('/^0/', '+212', $rawPhone);

        $order = Order::with(['items.product', 'shippingMethod'])
            ->where('order_number', $orderNumber)
            ->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found. Please check your order number and phone.'], 404);
        }

        // Normalize both phones to digits-only local format for comparison
        if (! $this->phonesMatch($request->phone, $order->customer_phone)) {
            return response()->json(['message' => 'Order not found. Please check your order number and phone.'], 404);
        }

        // Generate the PDF
        $pdfBinary = $this->invoiceService->generatePdf($order);

        // Return as downloadable file
        return response()->streamDownload(
            function () use ($pdfBinary) {
                echo $pdfBinary;
            },
            "invoice-{$order->order_number}.pdf",
            [
                'Content-Type'        => 'application/pdf',
                'Content-Disposition' => "attachment; filename=\"invoice-{$order->order_number}.pdf\"",
            ]
        );
    }

    /**
     * Compare two phone numbers ignoring formatting differences.
     * Handles: spaces, dashes, +212 vs 0 prefix (Moroccan numbers).
     */
    private function phonesMatch(string $a, string $b): bool
    {
        return $this->normalizePhone($a) === $this->normalizePhone($b);
    }

    private function normalizePhone(string $phone): string
    {
        // Strip all non-digit chars except leading +
        $digits = preg_replace('/[^\d]/', '', $phone);

        // +212XXXXXXXXX → 0XXXXXXXXX
        if (str_starts_with($digits, '212') && strlen($digits) === 12) {
            $digits = '0' . substr($digits, 3);
        }

        return $digits;
    }
}
