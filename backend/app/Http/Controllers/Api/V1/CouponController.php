<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CouponValidationResource;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CouponController extends Controller
{
    /**
     * POST /api/v1/coupons/validate
     * Body: { code: string, order_subtotal: number }
     */
    public function check(Request $request): JsonResponse
    {
        $request->validate([
            'code'            => ['required', 'string', 'max:50'],
            'order_subtotal'  => ['required', 'numeric', 'min:0'],
        ]);

        $coupon = Coupon::where('code', strtoupper(trim($request->code)))->first();

        if (! $coupon) {
            return response()->json(['message' => 'Coupon not found.'], 404);
        }

        if (! $coupon->isUsable()) {
            return response()->json(['message' => 'This coupon is no longer valid.'], 422);
        }

        if ((float) $request->order_subtotal < (float) $coupon->min_order_amount) {
            return response()->json([
                'message' => "Minimum order amount of {$coupon->min_order_amount} required.",
            ], 422);
        }

        // Calculate discount
        $discount = $coupon->type === 'percent'
            ? round((float) $request->order_subtotal * ($coupon->value / 100), 2)
            : (float) $coupon->value;

        $discount = min($discount, (float) $request->order_subtotal);

        return response()->json([
            'valid'    => true,
            'coupon'   => new CouponValidationResource($coupon),
            'discount' => $discount,
        ]);
    }
}
