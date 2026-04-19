<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductDetailResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;

class ProductController extends Controller
{
    /**
     * GET /api/v1/products
     * Supports: ?search=, ?brand=, ?brand_ids[]=, ?category=, ?category_ids[]=,
     *           ?gender=, ?is_featured=, ?limit=, ?sort=popular|price_asc|price_desc|newest, ?page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with(['brand', 'category', 'productType', 'variants', 'images' => fn ($q) => $q->orderBy('sort_order')])
            ->withAvg('reviews as avg_rating', 'rating')
            ->withCount('reviews as review_count')
            ->where('is_active', true);

        // Search
        if ($search = $request->query('search')) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Filters
        if ($brand = $request->query('brand')) {
            $query->whereHas('brand', fn ($q) => $q->where('slug', $brand));
        }

        if ($brandIds = $request->query('brand_ids')) {
            $query->whereIn('brand_id', (array) $brandIds);
        }

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($categoryIds = $request->query('category_ids')) {
            $query->whereIn('category_id', (array) $categoryIds);
        }

        if ($ingredientIds = $request->query('ingredient_ids')) {
            $query->whereHas('ingredientItems', fn ($q) => $q->whereIn('ingredients.id', (array) $ingredientIds));
        }

        // Specific product IDs (used by wishlist page)
        if ($ids = $request->query('ids')) {
            $query->whereIn('id', array_map('intval', (array) $ids));
        }

        if ($request->filled('is_gift')) {
            $query->where('is_gift', true);
        }

        if ($productType = $request->query('product_type')) {
            $query->whereHas('productType', fn ($q) => $q->where('slug', $productType));
        }

        if ($gender = $request->query('gender')) {
            $query->where('gender', $gender);
        }

        // Price range filter (frontend sends price_min / price_max)
        if ($request->filled('price_min')) {
            $query->where('price', '>=', (float) $request->query('price_min'));
        }

        if ($request->filled('price_max')) {
            $query->where('price', '<=', (float) $request->query('price_max'));
        }

        // Minimum average rating filter (frontend sends min_rating)
        if ($request->filled('min_rating')) {
            $minRating = (float) $request->query('min_rating');
            $query->whereExists(function ($q) use ($minRating) {
                $q->select(DB::raw('1'))
                  ->from('reviews')
                  ->whereColumn('reviews.product_id', 'products.id')
                  ->groupBy('reviews.product_id')
                  ->havingRaw('AVG(rating) >= ?', [$minRating]);
            });
        }

        // Promotions filter (products where original_price > price)
        if ($request->filled('on_promotion')) {
            $query->whereColumn('original_price', '>', 'price');
        }

        // is_featured=1 → featured only | is_featured=0 → non-featured only
        if ($request->filled('is_featured')) {
            $query->where('is_featured', filter_var($request->query('is_featured'), FILTER_VALIDATE_BOOLEAN));
        }

        // Sorting
        $sort = $request->query('sort', 'newest');

        if ($sort === 'brand_az') {
            // Join brands with an alias so it doesn't conflict with the eager-loaded relation
            $query->leftJoin('brands as sort_brands', 'sort_brands.id', '=', 'products.brand_id')
                  ->orderBy('sort_brands.name', 'asc')
                  ->select('products.*');
        } elseif ($sort === 'last_7_days') {
            $query->where('products.created_at', '>=', now()->subDays(7))
                  ->orderBy('products.created_at', 'desc');
        } elseif ($sort === 'last_30_days') {
            $query->where('products.created_at', '>=', now()->subDays(30))
                  ->orderBy('products.created_at', 'desc');
        } elseif ($sort === 'this_month') {
            $query->whereMonth('products.created_at', now()->month)
                  ->whereYear('products.created_at', now()->year)
                  ->orderBy('products.created_at', 'desc');
        } else {
            match ($sort) {
                'price_asc'  => $query->orderBy('products.price', 'asc'),
                'price_desc' => $query->orderBy('products.price', 'desc'),
                'popular'    => $query->orderBy('review_count', 'desc'),
                default      => $query->orderBy('products.created_at', 'desc'),
            };
        }

        // Build cache key from query parameters (15-min cache for product lists)
        // Cache key includes all filters, sort, limit to ensure exact same queries are cached together
        $cacheKey = 'products:' . md5(json_encode($request->query()));
        $cacheTTL = 15; // minutes

        // If a specific limit is requested (e.g. BestSellers widget), honour it.
        // Otherwise return ALL matching products with no cap.
        if ($request->filled('limit')) {
            $limit = (int) $request->query('limit');
            $products = Cache::remember($cacheKey, now()->addMinutes($cacheTTL), function () use ($query, $limit) {
                return $query->paginate($limit);
            });
            return ProductResource::collection($products);
        }

        // Cache list queries (without limit)
        $products = Cache::remember($cacheKey, now()->addMinutes($cacheTTL), function () use ($query) {
            return $query->get();
        });

        return ProductResource::collection($products);
    }

    /**
     * GET /api/v1/products/{slug}
     *
     * Cached for 20 minutes per slug.
     * Recommendations are fetched & cached separately (30-min TTL, max 8 items)
     * to avoid the N+1 issue of re-fetching all 70+ recommended products on every visit.
     */
    public function show(string $slug): ProductDetailResource|JsonResponse
    {
        $cacheKey = 'product:' . $slug;

        $product = Cache::remember($cacheKey, now()->addMinutes(20), function () use ($slug) {
            return Product::with([
                'brand',
                'category',
                'productType',
                'images'         => fn ($q) => $q->orderBy('sort_order'),
                'sizes',
                'variants',
                'ingredientItems',
                'reviews'        => fn ($q) => $q->where('is_approved', true)->with('images')->latest()->limit(20),
                'faqs',
            ])
            ->withAvg('reviews as avg_rating', 'rating')
            ->withCount('reviews as review_count')
            ->where('slug', $slug)
            ->where('is_active', true)
            ->first();
        });

        if (! $product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        // Attach pre-cached recommendations to avoid the Resource firing a raw DB query.
        // Cached for 30 min — same list is reused across all product detail pages.
        $product->setRelation('cachedRecommendations', $this->getCachedRecommendations());

        return new ProductDetailResource($product);
    }

    /**
     * Fetch the recommended products carousel, limited to 8 items, cached 30 min.
     * Extracted from ProductDetailResource to ensure this query is:
     *   1. Run only in the controller (not inside toArray)
     *   2. Cached independently from the product detail itself
     *   3. Limited to 8 — not returning 74 products on every page load
     */
    private function getCachedRecommendations(): \Illuminate\Support\Collection
    {
        return Cache::remember('recommendations:carousel', now()->addMinutes(30), function () {
            return Product::where('is_recommended', true)
                ->where('is_active', true)
                ->select(['id', 'name', 'slug', 'subtitle', 'price', 'original_price', 'stock',
                          'is_active', 'is_featured', 'is_best_seller', 'is_gift', 'is_recommended',
                          'brand_id'])
                ->with([
                    'brand'   => fn ($q) => $q->select(['id', 'name', 'slug']),
                    'images'  => fn ($q) => $q->orderBy('sort_order')->limit(2),
                ])
                ->withAvg('reviews as avg_rating', 'rating')
                ->withCount('reviews as review_count')
                ->orderBy('id')
                ->limit(8)
                ->get();
        });
    }

    /**
     * GET /api/v1/products/aggregates
     * Returns min/max price from the DB using native SQL aggregates.
     * No PHP-side collection filtering — MySQL computes the true MIN/MAX.
     */
    public function aggregates(Request $request): JsonResponse
    {
        $data = Cache::remember('products:aggregates', now()->addMinutes(15), function () {
            $agg = Product::where('is_active', true)
                ->whereNotNull('price')
                ->where('price', '>', 0)
                ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
                ->first();

            $min = $agg && $agg->min_price !== null ? (float) $agg->min_price : 0;
            $max = $agg && $agg->max_price !== null ? (float) $agg->max_price : 0;

            return ['min_price' => $min, 'max_price' => $max];
        });

        if ($data['min_price'] === 0.0 && $data['max_price'] === 0.0) {
            return response()->json(['data' => ['min_price' => 0, 'max_price' => 0, 'buckets' => array_fill(0, 10, 0)]]);
        }

        return response()->json(['data' => [...$data, 'buckets' => []]]);
    }
}
