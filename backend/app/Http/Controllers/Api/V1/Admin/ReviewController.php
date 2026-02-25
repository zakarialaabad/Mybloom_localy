<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    /**
     * GET /api/v1/admin/reviews
     * Supports: ?approved=0|1, ?product_id=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Review::with(['product', 'images'])
            ->orderBy('created_at', 'desc');

        if ($request->has('approved')) {
            $query->where('is_approved', (bool) $request->query('approved'));
        }

        if ($productId = $request->query('product_id')) {
            $query->where('product_id', $productId);
        }

        return ReviewResource::collection($query->paginate(25));
    }

    /**
     * PATCH /api/v1/admin/reviews/{review}/approve
     */
    public function approve(Review $review): JsonResponse
    {
        $review->update([
            'is_approved' => true,
            'approved_at' => now(),
        ]);

        return response()->json(['message' => 'Review approved.', 'data' => new ReviewResource($review)]);
    }

    /**
     * PATCH /api/v1/admin/reviews/{review}/reject
     */
    public function reject(Review $review): JsonResponse
    {
        $review->update([
            'is_approved' => false,
            'approved_at' => null,
        ]);

        return response()->json(['message' => 'Review rejected.']);
    }

    /**
     * DELETE /api/v1/admin/reviews/{review}
     */
    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json(['message' => 'Review deleted.']);
    }
}
