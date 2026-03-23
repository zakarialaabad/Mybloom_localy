<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Jobs\AdvanceOrderStatus;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orderService)
    {
    }

    /**
     * GET /api/v1/admin/orders
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Order::with(['shippingMethod'])
            ->withCount('items')
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
     * 
     * Loads full order details including items with product images
     */
    public function show(Order $order): JsonResponse
    {
        // Load relationships: items with product and its images, status histories, shipping, coupon
        $order->load([
            'items.product.images',  // ← Now includes product images for each item
            'statusHistories', 
            'shippingMethod', 
            'coupon'
        ]);

        return response()->json(['data' => new OrderResource($order)]);
    }

    /**
     * PATCH /api/v1/admin/orders/{order}/status
     *
     * Updates order status and records a status history entry so the
     * customer tracking timeline stays in sync with admin actions.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'string', 'in:pending,confirmed,preparing,shipped,delivered,cancelled'],
        ]);

        $newStatus = $request->status;

        // Guard: "delivered" can only be set once the order has reached "shipped"
        if ($newStatus === 'delivered' && $order->status !== 'shipped') {
            return response()->json([
                'message' => 'Order must be in "shipped" (Out for Delivery) status before it can be marked as delivered.',
            ], 422);
        }

        $statusLabels = [
            'pending'   => 'Order received and awaiting confirmation.',
            'confirmed' => 'Order confirmed and being processed.',
            'preparing' => 'Your order is being carefully prepared and packed.',
            'shipped'   => 'Your order is out for delivery and on the way to you.',
            'delivered' => 'Order delivered successfully.',
            'cancelled' => 'Order has been cancelled.',
        ];

        $this->orderService->recordStatusChange(
            $order,
            $newStatus,
            $statusLabels[$newStatus] ?? ucfirst($newStatus),
        );

        // Schedule automatic status advances:
        //   confirmed  --[6h]--> preparing  --[3h]--> shipped
        // (The shipped→delivered transition is always manual.)
        if ($newStatus === 'confirmed') {
            AdvanceOrderStatus::dispatch($order->id, 'confirmed', 'preparing')
                ->delay(now()->addHours(6));
        }

        return response()->json([
            'message' => 'Order status updated.',
            'status'  => $order->fresh()->status,
        ]);
    }

    /**
     * POST /api/v1/admin/orders/{order}/status-history
     *
     * Manually appends a custom history entry (e.g. with location details)
     * without changing the order's main status field.
     */
    public function addStatusHistory(Request $request, Order $order): JsonResponse
    {
        $data = $request->validate([
            'status'   => ['required', 'string', 'max:50'],
            'label'    => ['required', 'string', 'max:200'],
            'location' => ['nullable', 'string', 'max:200'],
        ]);

        $history = $order->statusHistories()->create($data);

        return response()->json(['data' => $history], 201);
    }

    /**
     * GET /api/v1/admin/orders/stats
     *
     * Returns aggregated counts with month-over-month trend %.
     */
    public function stats(): JsonResponse
    {
        $now                 = now();
        $startOfCurrentMonth = $now->copy()->startOfMonth();
        $startOfLastMonth    = $now->copy()->subMonth()->startOfMonth();
        $endOfLastMonth      = $now->copy()->subMonth()->endOfMonth();

        $calculateTrend = function ($current, $previous) {
            if ($previous == 0) return $current > 0 ? 100 : 0;
            return round((($current - $previous) / $previous) * 100, 1);
        };

        $totalAllTime  = Order::count();
        $currentTotal  = Order::where('created_at', '>=', $startOfCurrentMonth)->count();
        $previousTotal = Order::whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        $confirmedAllTime  = Order::where('status', 'confirmed')->count();
        $currentConfirmed  = Order::where('status', 'confirmed')->where('created_at', '>=', $startOfCurrentMonth)->count();
        $previousConfirmed = Order::where('status', 'confirmed')->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        $deliveredAllTime  = Order::where('status', 'delivered')->count();
        $currentDelivered  = Order::where('status', 'delivered')->where('created_at', '>=', $startOfCurrentMonth)->count();
        $previousDelivered = Order::where('status', 'delivered')->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])->count();

        return response()->json([
            'total' => [
                'count' => $totalAllTime,
                'trend' => $calculateTrend($currentTotal, $previousTotal),
            ],
            'confirmed' => [
                'count' => $confirmedAllTime,
                'trend' => $calculateTrend($currentConfirmed, $previousConfirmed),
            ],
            'delivered' => [
                'count' => $deliveredAllTime,
                'trend' => $calculateTrend($currentDelivered, $previousDelivered),
            ],
        ]);
    }
}
