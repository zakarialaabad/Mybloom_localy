<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\ReviewImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    /**
     * GET /api/v1/reviews
     *
     * When ?product_id= is given → scoped to that product.
     * Otherwise → all approved reviews (homepage carousel, etc.).
     *
     * Params:
     *   product_id  (optional) integer
     *   limit       (optional) integer, alias of per_page, default 15, max 50
     *   featured    (optional) boolean — when true, prefers reviews that have images
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $request->validate([
            'product_id' => ['nullable', 'integer', 'exists:products,id'],
            'limit'      => ['nullable', 'integer', 'min:1'],
        ]);

        $baseQuery = Review::where('is_approved', true);

        if ($request->filled('product_id')) {
            $baseQuery->where('product_id', $request->integer('product_id'));
        }

        // ── Rating summary aggregation ────────────────────────────────────────
        $total = (clone $baseQuery)->count();
        $average = $total > 0
            ? round((clone $baseQuery)->avg('rating'), 1)
            : 0;

        $distribution = [];
        if ($total > 0) {
            $counts = (clone $baseQuery)
                ->selectRaw('rating, COUNT(*) as count')
                ->groupBy('rating')
                ->pluck('count', 'rating');

            for ($star = 5; $star >= 1; $star--) {
                $count = $counts->get($star, 0);
                $distribution[$star] = [
                    'count'      => (int) $count,
                    'percentage' => $total > 0 ? round(($count / $total) * 100) : 0,
                ];
            }
        } else {
            for ($star = 5; $star >= 1; $star--) {
                $distribution[$star] = ['count' => 0, 'percentage' => 0];
            }
        }

        $ratingSummary = [
            'average'      => $average,
            'total'        => $total,
            'distribution' => $distribution,
        ];
        // ─────────────────────────────────────────────────────────────────────

        $query = (clone $baseQuery)->with('images');

        // When featured=true, surface reviews that have photos first
        if (filter_var($request->query('featured'), FILTER_VALIDATE_BOOLEAN)) {
            $query->orderByRaw(
                'EXISTS(SELECT 1 FROM review_images WHERE review_images.review_id = reviews.id) DESC'
            );
        }

        // Primary sort: highest rating first; secondary: newest first
        $query->orderBy('rating', 'desc')->latest();

        // When no limit is requested, return every matching review
        if (! $request->filled('limit')) {
            return ReviewResource::collection($query->get())
                ->additional(['rating_summary' => $ratingSummary]);
        }

        return ReviewResource::collection($query->paginate($request->integer('limit')))
            ->additional(['rating_summary' => $ratingSummary]);
    }

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

        // Extract uploaded images before creating — they are not DB columns on reviews
        $uploadedFiles = $request->file('images', []);

        $review = Review::create([
            'product_id'    => $data['product_id'],
            'order_number'  => $data['order_number'] ?? null,
            'reviewer_name' => $data['reviewer_name'],
            'rating'        => $data['rating'],
            'body'          => $data['body'] ?? null,
            'is_approved'   => true,
        ]);

        // Persist each uploaded photo and link it to the review
        foreach ($uploadedFiles as $file) {
            $path = $file->store('review-images', 'public');
            ReviewImage::create([
                'review_id' => $review->id,
                'url'       => Storage::disk('public')->url($path),
            ]);
        }

        $review->load('images');

        return response()->json([
            'message' => 'Review submitted and pending approval.',
            'data'    => new ReviewResource($review),
        ], 201);
    }
}
