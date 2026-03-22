<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\AdminCouponResource;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class CouponController extends Controller
{
    /**
     * GET /api/v1/admin/coupons
     *
     * Filters:
     *   ?status=   all | active | inactive | expired   (default: all)
     *   ?search=   code substring
     *   ?page=     pagination
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Coupon::orderBy('created_at', 'desc');

        // Status filter
        $status = $request->query('status', 'all');
        if ($status === 'active') {
            $query->where('is_active', true)
                  ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()));
        } elseif ($status === 'inactive') {
            $query->where('is_active', false);
        } elseif ($status === 'expired') {
            $query->where('expires_at', '<=', now());
        }

        // Code search
        if ($search = $request->query('search')) {
            $query->where('code', 'like', '%' . strtoupper(trim($search)) . '%');
        }

        return AdminCouponResource::collection($query->paginate(20));
    }

    /**
     * GET /api/v1/admin/coupons/stats
     *
     * Returns:
     *   - total           int   all coupons
     *   - active          int   usable right now
     *   - expiring_soon   int   expire within next 7 days
     *   - total_redemptions int sum of used_count
     */
    public function stats(): JsonResponse
    {
        $total              = Coupon::count();
        $totalRedemptions   = (int) Coupon::sum('used_count');
        $active             = Coupon::where('is_active', true)
                                ->where(fn ($q) => $q->whereNull('expires_at')->orWhere('expires_at', '>', now()))
                                ->count();
        $expiringSoon       = Coupon::where('is_active', true)
                                ->whereBetween('expires_at', [now(), now()->addDays(7)])
                                ->count();

        return response()->json([
            'total'             => $total,
            'active'            => $active,
            'expiring_soon'     => $expiringSoon,
            'total_redemptions' => $totalRedemptions,
        ]);
    }

    /**
     * POST /api/v1/admin/coupons
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'code'             => ['required', 'string', 'max:50', 'unique:coupons,code'],
            'type'             => ['required', Rule::in(['percent', 'fixed'])],
            'value'            => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit'      => ['nullable', 'integer', 'min:1'],
            'expires_at'       => ['nullable', 'date', 'after:now'],
            'is_active'        => ['nullable', 'boolean'],
        ]);

        $data['code'] = strtoupper(trim($data['code']));
        $coupon = Coupon::create($data);

        return response()->json(['data' => new AdminCouponResource($coupon)], 201);
    }

    /**
     * GET /api/v1/admin/coupons/{coupon}
     */
    public function show(Coupon $coupon): JsonResponse
    {
        return response()->json(['data' => new AdminCouponResource($coupon)]);
    }

    /**
     * PUT /api/v1/admin/coupons/{coupon}
     */
    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $data = $request->validate([
            'code'             => ['sometimes', 'string', 'max:50', Rule::unique('coupons', 'code')->ignore($coupon->id)],
            'type'             => ['sometimes', Rule::in(['percent', 'fixed'])],
            'value'            => ['sometimes', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit'      => ['nullable', 'integer', 'min:1'],
            'expires_at'       => ['nullable', 'date'],
            'is_active'        => ['nullable', 'boolean'],
        ]);

        if (isset($data['code'])) {
            $data['code'] = strtoupper(trim($data['code']));
        }

        $coupon->update($data);

        return response()->json(['data' => new AdminCouponResource($coupon->fresh())]);
    }

    /**
     * DELETE /api/v1/admin/coupons/{coupon}
     */
    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted.']);
    }
}
