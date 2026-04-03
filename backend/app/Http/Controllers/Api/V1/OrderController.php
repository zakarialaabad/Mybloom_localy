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
     * GET /api/v1/invoices/{orderNumber}/download
     *
     * Generate and download the PDF invoice for an order.
     * No authentication required — link can be shared with customers.
     */
    public function downloadInvoice(string $orderNumber)
    {
        $order = Order::with(['items.product', 'shippingMethod'])
            ->where('order_number', $orderNumber)
            ->firstOrFail();

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
