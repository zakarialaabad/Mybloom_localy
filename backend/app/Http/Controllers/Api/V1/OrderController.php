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
            ->where('customer_phone', $request->phone)
            ->first();

        if (! $order) {
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
            ->where('customer_phone', $normalPhone)
            ->first();

        if (! $order) {
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
}
