<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * GET /api/v1/admin/dashboard
     *
     * Returns all data needed by the admin dashboard in a single request:
     *   - summary cards  (revenue, orders, top-selling product)
     *   - sales chart    (revenue per day for the last 7 days)
     *   - top customers  (by total spend)
     *   - recent orders  (latest 10)
     */
    public function index(): JsonResponse
    {
        try {
            return response()->json([
                'summary'        => $this->summary(),
                'sales_chart'    => $this->salesChart(),
                'top_customers'  => $this->topCustomers(),
                'recent_orders'  => $this->recentOrders(),
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('DashboardController error: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
            ]);
            return response()->json(['message' => 'Failed to load dashboard data.'], 500);
        }
    }

    /* ────────────────────────────────────────────────────────────────────────
     * SUMMARY CARDS
     * ──────────────────────────────────────────────────────────────────────── */

    private function summary(): array
    {
        // ── Total revenue ────────────────────────────────────────────────────
        $totalRevenue = Order::sum('total');

        // ── Revenue last month (for trend %) ────────────────────────────────
        $lastMonthRevenue = Order::whereBetween('created_at', [
            Carbon::now()->subMonths(2)->startOfMonth(),
            Carbon::now()->subMonth()->endOfMonth(),
        ])->sum('total');

        $revenueTrend = $lastMonthRevenue > 0
            ? round((($totalRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
            : 0;

        // ── Total orders ─────────────────────────────────────────────────────
        $totalOrders = Order::count();

        $lastMonthOrders = Order::whereBetween('created_at', [
            Carbon::now()->subMonths(2)->startOfMonth(),
            Carbon::now()->subMonth()->endOfMonth(),
        ])->count();

        $ordersTrend = $lastMonthOrders > 0
            ? round((($totalOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 1)
            : 0;

        // ── Top-selling product ───────────────────────────────────────────────
        $topProduct = OrderItem::select('product_id', DB::raw('SUM(quantity) as total_sold'))
            ->groupBy('product_id')
            ->orderByDesc('total_sold')
            ->with('product:id,name,subtitle')
            ->first();

        return [
            'total_revenue'   => (float) $totalRevenue,
            'revenue_trend'   => $revenueTrend,
            'total_orders'    => $totalOrders,
            'orders_trend'    => $ordersTrend,
            'top_product'     => $topProduct ? [
                'name'       => $topProduct->product?->name ?? 'N/A',
                'subtitle'   => $topProduct->product?->subtitle ?? '',
                'units_sold' => (int) $topProduct->total_sold,
            ] : ['name' => 'N/A', 'subtitle' => '', 'units_sold' => 0],
        ];
    }

    /* ────────────────────────────────────────────────────────────────────────
     * SALES CHART — revenue per day for the last 7 days
     * ──────────────────────────────────────────────────────────────────────── */

    private function salesChart(): array
    {
        $days = collect(range(6, 0))->map(fn ($i) => Carbon::today()->subDays($i));

        // Query revenue and order count grouped by date
        $rows = Order::select(
                DB::raw('DATE(created_at) as day'),
                DB::raw('SUM(total) as revenue'),
                DB::raw('COUNT(*) as order_count')
            )
            ->where('created_at', '>=', Carbon::today()->subDays(6)->startOfDay())
            ->groupBy('day')
            ->get()
            ->keyBy('day');

        $labels  = [];
        $values  = [];
        $orders  = [];

        foreach ($days as $day) {
            $labels[]  = $day->format('D'); // Mon, Tue ...
            $key       = $day->format('Y-m-d');
            $values[]  = isset($rows[$key]) ? (float) $rows[$key]->revenue : 0;
            $orders[]  = isset($rows[$key]) ? (int) $rows[$key]->order_count : 0;
        }

        return [
            'labels' => $labels,
            'values' => $values,
            'orders' => $orders,
        ];
    }

    /* ────────────────────────────────────────────────────────────────────────
     * TOP CUSTOMERS — ranked by total spend
     * ──────────────────────────────────────────────────────────────────────── */

    private function topCustomers(): array
    {
        return Order::select(
                'customer_phone',
                'customer_name',
                DB::raw('COUNT(*) as order_count'),
                DB::raw('SUM(total) as total_spent')
            )
            ->groupBy('customer_phone', 'customer_name')
            ->orderByDesc('total_spent')
            ->limit(12)
            ->get()
            ->map(fn ($row) => [
                'phone'       => $row->customer_phone,
                'name'        => $row->customer_name,
                'orders'      => (int) $row->order_count,
                'total_spent' => (float) $row->total_spent,
            ])
            ->toArray();
    }

    /* ────────────────────────────────────────────────────────────────────────
     * RECENT ORDERS — latest 10 with first item's product name
     * ──────────────────────────────────────────────────────────────────────── */

    private function recentOrders(): array
    {
        return Order::with('items')
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(fn (Order $order) => [
                'id'           => $order->id,
                'order_number' => $order->order_number,
                'items_count'  => (int) $order->items->sum('quantity'),
                'date'         => $order->created_at->format('M d, Y'),
                'customer'     => $order->customer_name,
                'phone'        => $order->customer_phone,
                'status'       => ucfirst($order->status),
                'amount'       => number_format((float) $order->total, 2) . ' Dhs',
            ])
            ->toArray();
    }
}
