<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductDetailResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * GET /api/v1/products
     * Supports: ?search=, ?brand=, ?category=, ?gender=, ?sort=popular|price_asc|price_desc|newest, ?page=
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with(['brand', 'category', 'images' => fn ($q) => $q->where('is_primary', true)])
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

        if ($category = $request->query('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $category));
        }

        if ($gender = $request->query('gender')) {
            $query->where('gender', $gender);
        }

        // Sorting
        match ($request->query('sort', 'newest')) {
            'price_asc'  => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'popular'    => $query->withCount(['allReviews as reviews_count'])->orderBy('reviews_count', 'desc'),
            default      => $query->orderBy('created_at', 'desc'),
        };

        return ProductResource::collection($query->paginate(20));
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
        ])->where('slug', $slug)->where('is_active', true)->first();

        if (! $product) {
            return response()->json(['message' => 'Product not found.'], 404);
        }

        return new ProductDetailResource($product);
    }
}
