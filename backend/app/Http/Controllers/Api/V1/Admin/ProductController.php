<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreProductRequest;
use App\Http\Requests\Admin\UpdateProductRequest;
use App\Http\Resources\ProductDetailResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    /**
     * GET /api/v1/admin/products
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::with(['brand', 'category'])
            ->withTrashed()
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return ProductResource::collection($products);
    }

    /**
     * POST /api/v1/admin/products
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $product = Product::create($request->validated());

        return response()->json(['data' => new ProductDetailResource($product->load(['brand', 'category', 'images', 'sizes']))], 201);
    }

    /**
     * GET /api/v1/admin/products/{product}
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => new ProductDetailResource($product->load(['brand', 'category', 'images', 'sizes', 'allReviews']))]);
    }

    /**
     * PUT /api/v1/admin/products/{product}
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $product->update($request->validated());

        return response()->json(['data' => new ProductDetailResource($product->fresh(['brand', 'category', 'images', 'sizes']))]);
    }

    /**
     * DELETE /api/v1/admin/products/{product}
     * Soft-deletes the product.
     */
    public function destroy(Product $product): JsonResponse
    {
        $product->delete();

        return response()->json(['message' => 'Product deleted.']);
    }

    /**
     * POST /api/v1/admin/products/{product}/images
     */
    public function storeImage(Request $request, Product $product): JsonResponse
    {
        $request->validate([
            'url'        => ['required', 'url', 'max:500'],
            'alt'        => ['nullable', 'string', 'max:200'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_primary' => ['nullable', 'boolean'],
        ]);

        if ($request->boolean('is_primary')) {
            $product->images()->update(['is_primary' => false]);
        }

        $image = $product->images()->create($request->only('url', 'alt', 'sort_order', 'is_primary'));

        return response()->json(['data' => $image], 201);
    }

    /**
     * DELETE /api/v1/admin/products/{product}/images/{id}
     */
    public function destroyImage(Product $product, int $id): JsonResponse
    {
        $image = ProductImage::where('product_id', $product->id)->findOrFail($id);
        $image->delete();

        return response()->json(['message' => 'Image removed.']);
    }
}
