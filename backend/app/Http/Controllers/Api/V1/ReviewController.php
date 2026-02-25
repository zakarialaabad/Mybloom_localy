<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class ReviewController extends Controller
{
    /**
     * POST /api/v1/reviews
     */
    public function store(StoreReviewRequest $request): JsonResponse
    {
        $data = $request->validated();

        // Verify the order number belongs to this product
        if (! empty($data['order_number'])) {
            $orderLinked = Order::where('order_number', $data['order_number'])
                ->whereHas('items', fn ($q) => $q->where('product_id', $data['product_id']))
                ->exists();

            if (! $orderLinked) {
                return response()->json([
                    'message' => 'The order number does not match this product.',
                ], 422);
            }
        }

        $review = Review::create(array_merge($data, ['is_approved' => false]));

        return response()->json([
            'message' => 'Review submitted and pending approval.',
            'data'    => new ReviewResource($review),
        ], 201);
    }
}
