<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    /**
     * GET /api/v1/admin/orders
     * Supports: ?status=, ?search= (customer name/phone/order_number)
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::with(['items', 'shippingMethod'])
            ->orderBy('created_at', 'desc');

        if ($status = $request->query('status')) {
            $query->where('status', $status);
        }

        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%");
            });
        }

        return OrderResource::collection($query->paginate(25));
    }

    /**
     * GET /api/v1/admin/orders/{order}
     */
    public function show(Order $order): JsonResponse
    {
        $order->load(['items.product', 'statusHistories', 'shippingMethod', 'coupon']);

        return response()->json(['data' => new OrderResource($order)]);
    }

    /**
     * PATCH /api/v1/admin/orders/{order}/status
     * Body: { status: string }
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'max:50'],
        ]);

        $order->update(['status' => $request->status]);

        return response()->json(['message' => 'Order status updated.', 'status' => $order->status]);
    }

    /**
     * POST /api/v1/admin/orders/{order}/status-history
     * Body: { status: string, label: string, location?: string }
     */
    public function addStatusHistory(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status'   => ['required', 'string', 'max:50'],
            'label'    => ['required', 'string', 'max:200'],
            'location' => ['nullable', 'string', 'max:200'],
        ]);

        $history = $order->statusHistories()->create($data);

        // Also sync top-level status
        $order->update(['status' => $data['status']]);

        return response()->json(['message' => 'Status history added.', 'data' => $history], 201);
    }
}
