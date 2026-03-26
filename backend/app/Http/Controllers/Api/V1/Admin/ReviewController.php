<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

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

        // Source filter: client = has order_number (submitted via /feedback)
        //                admin  = no order_number (curated by admin)
        $source = $request->query('source');
        if ($source === 'client') {
            $query->whereNotNull('order_number');
        } elseif ($source === 'admin') {
            $query->whereNull('order_number');
        }

        // Sort order
        $sort = $request->query('sort', 'newest');
        $query->reorder('created_at', $sort === 'oldest' ? 'asc' : 'desc');

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
        // Stats apply only to admin-curated reviews (order_number IS NULL)
        // Client-submitted feedback (with order_number) is tracked separately
        $base = Review::whereNull('order_number');

        $total   = (clone $base)->count();
        $pending = (clone $base)->where('is_approved', false)->count();

        $average = $total > 0
            ? round((clone $base)->avg('rating'), 1)
            : 0.0;

        // Star distribution (admin-curated reviews only)
        $distributionRaw = (clone $base)
            ->selectRaw('rating, COUNT(*) as count')
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

        // Most-reviewed product (admin-curated reviews only)
        $mostReviewed = (clone $base)
            ->select('product_id', DB::raw('COUNT(*) as review_count'))
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
            'product_id'    => 'sometimes|nullable|integer|exists:products,id',
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

    /**
     * POST /api/v1/admin/reviews
     * Admin creates a curated review (no order_number — distinct from client feedback).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'reviewer_name' => 'required|string|max:255',
            'rating'        => 'required|integer|min:1|max:5',
            'body'          => 'nullable|string|max:5000',
            'product_id'    => 'nullable|integer|exists:products,id',
            'images.*'      => 'nullable|file|image|max:5120',
        ]);

        $review = Review::create([
            'reviewer_name' => $validated['reviewer_name'],
            'rating'        => $validated['rating'],
            'body'          => $validated['body'] ?? null,
            'product_id'    => $validated['product_id'] ?? null,
            'is_approved'   => true,
            'approved_at'   => now(),
        ]);

        foreach ($request->file('images', []) as $file) {
            $path = $file->store('review-images', 'public');
            ReviewImage::create([
                'review_id' => $review->id,
                'url'       => Storage::disk('public')->url($path),
            ]);
        }

        return response()->json([
            'message' => 'Review created.',
            'data'    => new ReviewResource($review->fresh(['product', 'images'])),
        ], 201);
    }
}
