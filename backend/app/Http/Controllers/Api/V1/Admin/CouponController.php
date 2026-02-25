<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class CouponController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return \App\Http\Resources\CouponValidationResource::collection(Coupon::orderBy('created_at', 'desc')->paginate(20));
    }

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

        return response()->json(['data' => $coupon], 201);
    }

    public function show(Coupon $coupon): JsonResponse
    {
        return response()->json(['data' => $coupon]);
    }

    public function update(Request $request, Coupon $coupon): JsonResponse
    {
        $data = $request->validate([
            'code'             => ['sometimes', 'string', 'max:50', "unique:coupons,code,{$coupon->id}"],
            'type'             => ['sometimes', Rule::in(['percent', 'fixed'])],
            'value'            => ['sometimes', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'usage_limit'      => ['nullable', 'integer', 'min:1'],
            'expires_at'       => ['nullable', 'date'],
            'is_active'        => ['nullable', 'boolean'],
        ]);

        $coupon->update($data);

        return response()->json(['data' => $coupon]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        $coupon->delete();

        return response()->json(['message' => 'Coupon deleted.']);
    }
}
