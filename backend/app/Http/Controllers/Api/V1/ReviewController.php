<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreReviewRequest;
use App\Http\Resources\ReviewResource;
use App\Models\Order;
use App\Models\Product;
use App\Models\Review;
use App\Models\ReviewImage;
use App\Services\ImageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class ReviewController extends Controller
{
    private ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

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

        // Cache per unique combination of request params (5-minute TTL).
        // Key is md5 of sorted query params so ?featured=1&product_id=3 and
        // ?product_id=3&featured=1 hit the same cache entry.
        $params = $request->only(['product_id', 'source', 'featured', 'limit']);
        ksort($params);
        $cacheKey = 'reviews:' . md5(json_encode($params));

        // Homepage reviews (admin-curated, no product_id) change rarely → 30-min TTL.
        // Product-scoped reviews can update when a customer submits → 5-min TTL.
        $ttl = $request->filled('product_id')
            ? now()->addMinutes(5)
            : now()->addMinutes(30);

        $result = Cache::remember($cacheKey, $ttl, function () use ($request) {
            return $this->buildReviewsResponse($request);
        });

        // $result is [collection_data, rating_summary, paginated] — re-wrap in resource
        return ReviewResource::collection($result['collection'])
            ->additional(['rating_summary' => $result['rating_summary']]);
    }

    /**
     * Inner query builder extracted so it can be wrapped by Cache::remember cleanly.
     */
    private function buildReviewsResponse(Request $request): array
    {
        $baseQuery = Review::where('is_approved', true);

        if ($request->filled('product_id')) {
            $baseQuery->where('product_id', $request->integer('product_id'));
        }

        $source = $request->query('source');
        if ($source === 'client') {
            $baseQuery->whereNotNull('order_number');
        } elseif ($source === 'admin' || ! $request->filled('product_id')) {
            $baseQuery->whereNull('order_number');
        }

        // ── Collapse 3 separate COUNT/AVG queries into 1 aggregate query ──
        $agg = (clone $baseQuery)
            ->selectRaw('COUNT(*) as total, AVG(rating) as average,
                SUM(rating = 5) as r5, SUM(rating = 4) as r4,
                SUM(rating = 3) as r3, SUM(rating = 2) as r2,
                SUM(rating = 1) as r1')
            ->first();

        $total   = (int) ($agg->total   ?? 0);
        $average = $total > 0 ? round((float) $agg->average, 1) : 0;

        $distribution = [];
        for ($star = 5; $star >= 1; $star--) {
            $col   = 'r' . $star;
            $count = (int) ($agg->$col ?? 0);
            $distribution[$star] = [
                'count'      => $count,
                'percentage' => $total > 0 ? round(($count / $total) * 100) : 0,
            ];
        }

        $ratingSummary = ['average' => $average, 'total' => $total, 'distribution' => $distribution];

        $query = (clone $baseQuery)->with('images');

        if (filter_var($request->query('featured'), FILTER_VALIDATE_BOOLEAN)) {
            $query->orderByRaw(
                'EXISTS(SELECT 1 FROM review_images WHERE review_images.review_id = reviews.id) DESC'
            );
        }

        $query->orderBy('rating', 'desc')->latest();

        $collection = $request->filled('limit')
            ? $query->paginate($request->integer('limit'))
            : $query->get();

        return ['collection' => $collection, 'rating_summary' => $ratingSummary];
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

        // Persist each uploaded photo and link it to the review using ImageService
        foreach ($uploadedFiles as $file) {
            try {
                $result = $this->imageService->process($file, 'review-images');
                ReviewImage::create([
                    'review_id' => $review->id,
                    'url'       => $result->relativePath,
                ]);
            } catch (\Exception $e) {
                \Illuminate\Support\Facades\Log::error('Failed to process review image', ['error' => $e->getMessage()]);
            }
        }

        $review->load('images');

        // Bust the product's review cache so the new review appears within 5 min.
        // We recompute the likely cache keys the frontend would request for this product.
        $productId = $review->product_id;
        foreach (['client', 'admin', null] as $src) {
            foreach ([null, '1'] as $featured) {
                $params = array_filter([
                    'product_id' => $productId,
                    'source'     => $src,
                    'featured'   => $featured,
                    'limit'      => null,
                ], fn ($v) => $v !== null);
                ksort($params);
                Cache::forget('reviews:' . md5(json_encode($params)));
            }
        }
        // Also bust the product detail cache so avg_rating / review_count refresh
        Cache::forget('product:' . ($review->product->slug ?? ''));

        return response()->json([
            'message' => 'Review submitted and pending approval.',
            'data'    => new ReviewResource($review),
        ], 201);
    }
}
