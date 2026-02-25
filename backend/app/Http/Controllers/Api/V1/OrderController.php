<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreOrderRequest;
use App\Http\Resources\OrderResource;
use App\Http\Resources\OrderTrackResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    /**
     * POST /api/v1/orders
     */
    public function store(StoreOrderRequest $request): JsonResponse
    {
        $order = $this->orderService->createOrder($request->validated());

        return response()->json([
            'message'      => 'Order placed successfully.',
            'order_number' => $order->order_number,
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

        $order = Order::with(['items.product', 'statusHistories', 'shippingMethod'])
            ->where('order_number', $orderNumber)
            ->where('customer_phone', $request->phone)
            ->first();

        if (! $order) {
            return response()->json(['message' => 'Order not found. Please check your order number and phone.'], 404);
        }

        return response()->json(['data' => new OrderTrackResource($order)]);
    }
}
