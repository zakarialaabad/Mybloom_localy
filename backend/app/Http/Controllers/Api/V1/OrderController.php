<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderTrackResource;
use App\Models\Order;
use App\Models\OrderWhatsAppDelivery;
use App\Services\InvoiceService;
use App\Services\OrderService;
use App\Support\WhatsAppPhone;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    public function __construct(
        private readonly OrderService $orderService,
        private readonly InvoiceService $invoiceService,
    ) {}

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
                'total' => (float) $order->total,
                'whatsapp_fallback_url' => $order->getAttribute('whatsapp_fallback_url'),
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

    public function whatsAppStatus(Request $request, string $orderNumber): JsonResponse
    {
        $request->validate(['phone' => ['required', 'string']]);
        $order = Order::where('order_number', $orderNumber)->first();
        if (! $order || ! $this->phonesMatch($request->phone, $order->customer_phone)) {
            return response()->json(['message' => 'Order not found. Please check your order number and phone.'], 404);
        }
        $delivery = OrderWhatsAppDelivery::where('order_id', $order->id)
            ->where('purpose', OrderWhatsAppDelivery::PURPOSE_CONFIRMATION)->first();

        return response()->json(['data' => [
            'status' => $delivery?->status ?? 'unavailable',
            'fallback_available' => $delivery?->fallbackIsAvailable() ?? true,
        ]]);
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

        $order = Order::with(['items.product.images', 'shippingMethod', 'coupon'])
            ->where('order_number', $orderNumber)
            ->first();

        if (! $order) {
            Log::warning("Invoice download failed: Order {$orderNumber} not found");

            return response()->json(['message' => 'Order not found. Please check your order number and phone.'], 404);
        }

        // Normalize both phones to digits-only local format for comparison
        if (! $this->phonesMatch($request->phone, $order->customer_phone)) {
            Log::warning("Invoice download failed: Phone mismatch for order {$orderNumber}");

            return response()->json(['message' => 'Order not found. Please check your order number and phone.'], 404);
        }

        return $this->streamInvoice($order);
    }

    /**
     * GET /api/v1/invoices/{orderNumber}/whatsapp-download?expires=&signature=
     *
     * The route signature is a short-lived bearer credential generated only by
     * the server for the customer's WhatsApp invoice message.
     */
    public function downloadInvoiceFromWhatsAppLink(string $orderNumber)
    {
        $order = Order::with(['items.product.images', 'shippingMethod', 'coupon'])
            ->where('order_number', $orderNumber)
            ->first();

        if (! $order) {
            return response()->json(['message' => 'Invoice not found.'], 404);
        }

        return $this->streamInvoice($order);
    }

    private function streamInvoice(Order $order)
    {
        try {
            $pdfBinary = $this->invoiceService->generatePdf($order);

            return response()->streamDownload(
                function () use ($pdfBinary) {
                    echo $pdfBinary;
                },
                "invoice-{$order->order_number}.pdf",
                [
                    'Content-Type' => 'application/pdf',
                    'Content-Disposition' => "attachment; filename=\"invoice-{$order->order_number}.pdf\"",
                ]
            );
        } catch (\Throwable $e) {
            Log::error("PDF generation failed for order {$order->order_number}: ".$e->getMessage(), [
                'exception' => $e,
                'order_id' => $order->id,
            ]);

            return response()->json([
                'message' => 'Failed to generate invoice PDF. Please try again later or contact support.',
                'error' => config('app.debug') ? $e->getMessage() : null,
            ], 500);
        }
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
            $digits = '0'.substr($digits, 3);
        }

        try {
            return WhatsAppPhone::normalizeMoroccan($phone);
        } catch (\InvalidArgumentException) {
            return '';
        }
    }
}
