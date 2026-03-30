<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\OrderTrackResource;
use App\Jobs\SendWhatsAppNotification;
use App\Models\Order;
use App\Services\OrderService;
use App\Services\InvoiceService;
use App\Services\WhatsAppService;
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
     * Create a new order and dispatch WhatsApp notification (if opted-in)
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        // Validate phone format
        if ($request->customer_phone && !WhatsAppService::isValidPhone($request->customer_phone)) {
            return response()->json([
                'message' => 'Invalid phone number format',
            ], 422);
        }

        $order = $this->orderService->createOrder($request->validated());

        // Dispatch WhatsApp notification if customer opted-in
        if ($order->whatsapp_opt_in && $order->customer_phone) {
            SendWhatsAppNotification::dispatch(
                $order->order_number,
                'order_confirmation',
                null  // Send to both customer and admin
            );
        }

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
     * POST /api/v1/orders/{orderNumber}/send-invoice
     *
     * Manually dispatch a WhatsApp notification for an existing order
     */
    public function sendInvoice(string $orderNumber): JsonResponse
    {
        $order = Order::where('order_number', $orderNumber)->firstOrFail();

        if (!$order->customer_phone) {
            return response()->json([
                'message' => 'Cannot send notification: customer phone not found on order.',
            ], 400);
        }

        SendWhatsAppNotification::dispatch(
            $order->order_number,
            'order_confirmation',
            null  // Send to both customer and admin
        );

        return response()->json([
            'message' => 'WhatsApp notification queued for delivery.',
            'queued'  => true,
        ], 202);
    }

    /**
     * GET /api/v1/invoices/{orderNumber}/download
     *
     * Generate and download the PDF invoice for an order.
     * No authentication required — link is shared via WhatsApp.
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
