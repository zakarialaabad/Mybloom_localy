<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProductRequest;
use App\Http\Requests\UpdateProductRequest;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    /**
     * List products (public) with optional search/filter.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
            ->when($request->category, fn ($q, $c) => $q->where('category', $c))
            ->orderBy($request->sort_by ?? 'created_at', $request->sort_dir ?? 'desc')
            ->paginate($request->per_page ?? 20);

        return ProductResource::collection($products);
    }

    /**
     * Show a single product (public).
     */
    public function show(Product $product): JsonResponse
    {
        return response()->json(['data' => new ProductResource($product)]);
    }

    /**
     * Create a new product — admin only.
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $this->authorizeAdmin();

        $product = Product::create($request->validated());

        return response()->json(['data' => new ProductResource($product)], 201);
    }

    /**
     * Update a product — admin only.
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        $this->authorizeAdmin();

        $product->update($request->validated());

        return response()->json(['data' => new ProductResource($product)]);
    }

    /**
     * Delete a product — admin only.
     */
    public function destroy(Product $product): JsonResponse
    {
        $this->authorizeAdmin();

        $product->delete();

        return response()->json(['message' => 'Product deleted successfully.']);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function authorizeAdmin(): void
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Forbidden: admin access required.');
        }
    }
}
