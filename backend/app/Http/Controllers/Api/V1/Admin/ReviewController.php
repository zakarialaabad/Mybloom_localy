<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    /**
     * GET /api/v1/admin/reviews
     *
     * Filters:
     *   ?status=   all | approved | pending  (default: all)
     *   ?rating=   1-5
     *   ?search=   reviewer_name or body
     *   ?product_id=  integer
     *   ?page=     pagination
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Review::with(['product', 'images'])
            ->orderBy('created_at', 'desc');

        // Status filter: approved | pending | all
        $status = $request->query('status', 'all');
        if ($status === 'approved') {
            $query->where('is_approved', true);
        } elseif ($status === 'pending') {
            $query->where('is_approved', false);
        }

        // Rating filter
        if ($rating = $request->query('rating')) {
            $query->where('rating', (int) $rating);
        }

        // Full-text search across reviewer name and review body
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('reviewer_name', 'like', "%{$search}%")
                  ->orWhere('body', 'like', "%{$search}%");
            });
        }

        // Product filter
        if ($productId = $request->query('product_id')) {
            $query->where('product_id', (int) $productId);
        }

        return ReviewResource::collection($query->paginate(25));
    }

    /**
     * GET /api/v1/admin/reviews/stats
     *
     * Returns aggregated metrics for the dashboard stat cards:
     *   - average_rating   float
     *   - total            int   (all reviews)
     *   - pending          int   (awaiting moderation)
     *   - distribution     array (counts per star 1-5)
     *   - most_reviewed    { product_name, count } | null
     */
    public function stats(): JsonResponse
    {
        $total   = Review::count();
        $pending = Review::where('is_approved', false)->count();

        $average = $total > 0
            ? round(Review::avg('rating'), 1)
            : 0.0;

        // Star distribution (all reviews)
        $distributionRaw = Review::selectRaw('rating, COUNT(*) as count')
            ->groupBy('rating')
            ->pluck('count', 'rating');

        $distribution = [];
        for ($star = 5; $star >= 1; $star--) {
            $count = (int) ($distributionRaw->get($star, 0));
            $distribution[$star] = [
                'count'      => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100) : 0,
            ];
        }

        // Most-reviewed product
        $mostReviewed = Review::select('product_id', DB::raw('COUNT(*) as review_count'))
            ->with('product:id,name')
            ->groupBy('product_id')
            ->orderByDesc('review_count')
            ->first();

        return response()->json([
            'average_rating' => $average,
            'total'          => $total,
            'pending'        => $pending,
            'distribution'   => $distribution,
            'most_reviewed'  => $mostReviewed ? [
                'product_name' => $mostReviewed->product?->name ?? 'N/A',
                'count'        => (int) $mostReviewed->review_count,
            ] : null,
        ]);
    }

    /**
     * PATCH /api/v1/admin/reviews/{review}
     * Editable fields: reviewer_name, rating, body
     */
    public function update(Request $request, Review $review): JsonResponse
    {
        $validated = $request->validate([
            'reviewer_name' => 'sometimes|required|string|max:255',
            'rating'        => 'sometimes|required|integer|min:1|max:5',
            'body'          => 'sometimes|nullable|string|max:5000',
        ]);

        $review->update($validated);

        return response()->json([
            'message' => 'Review updated.',
            'data'    => new ReviewResource($review->fresh(['product', 'images'])),
        ]);
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
