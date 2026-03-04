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

class ProductController extends Controller
{
    /**
     * GET /api/v1/products
     * Supports: ?search=, ?brand=, ?brand_ids[]=, ?category=, ?category_ids[]=,
     *           ?gender=, ?is_featured=, ?limit=, ?sort=popular|price_asc|price_desc|newest, ?page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with(['brand', 'category', 'images' => fn ($q) => $q->where('is_primary', true)])
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
        match ($request->query('sort', 'newest')) {
            'price_asc'  => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'popular'    => $query->orderBy('review_count', 'desc'),
            default      => $query->orderBy('created_at', 'desc'),
        };

        $perPage = min((int) ($request->query('limit', 20)), 100);

        return ProductResource::collection($query->paginate($perPage));
    }

    /**
     * GET /api/v1/products/{slug}
     */
    public function show(string $slug): ProductDetailResource|JsonResponse
    {
        $product = Product::with([
            'brand',
            'category',
            'images',
            'sizes',
            'reviews.images',
        ])
        ->withAvg('reviews as avg_rating', 'rating')
        ->withCount('reviews as review_count')
        ->where('slug', $slug)
        ->where('is_active', true)
        ->first();

        if (! $product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        return new ProductDetailResource($product);
    }

    /**
     * GET /api/v1/products/aggregates
     * Returns min/max price from the DB using native SQL aggregates.
     * No PHP-side collection filtering — MySQL computes the true MIN/MAX.
     */
    public function aggregates(Request $request): JsonResponse
    {
        $agg = Product::where('is_active', true)
            ->whereNotNull('price')
            ->where('price', '>', 0)
            ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
            ->first();

        $min = $agg && $agg->min_price !== null ? (float) $agg->min_price : 0;
        $max = $agg && $agg->max_price !== null ? (float) $agg->max_price : 0;

        if ($min === 0.0 && $max === 0.0) {
            return response()->json(['data' => ['min_price' => 0, 'max_price' => 0, 'buckets' => array_fill(0, 10, 0)]]);
        }

        return response()->json(['data' => ['min_price' => $min, 'max_price' => $max, 'buckets' => []]]);
    }
}
