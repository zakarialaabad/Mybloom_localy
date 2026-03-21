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
     *
     * Query params:
     *   search      string   filter by name / subtitle / category name
     *   category_id int      filter by category
     *   per_page    int      default 100, max 200
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Product::with(['brand', 'category', 'productType', 'images', 'variants'])
            ->withTrashed()
            ->orderBy('created_at', 'desc');

        // Full-text search across name, subtitle and category name
        if ($search = trim((string) $request->get('search', ''))) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('subtitle', 'like', "%{$search}%")
                  ->orWhereHas('category', fn ($c) => $c->where('name', 'like', "%{$search}%"));
            });
        }

        // Filter by category
        if ($categoryId = $request->get('category_id')) {
            $query->where('category_id', (int) $categoryId);
        }

        $perPage = min((int) $request->get('per_page', 100), 200);
        $products = $query->paginate($perPage);

        return ProductResource::collection($products);
    }

    /**
     * POST /api/v1/admin/products
     */
    public function store(StoreProductRequest $request): JsonResponse
    {
        $validated = $request->validated();
        
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $product = Product::create($validated);

            // Variants — syncVariants() also updates products.price / original_price
            if (!empty($validated['variants_array'])) {
                $variantService = new \App\Services\VariantService();
                $variantService->syncVariants($product, $validated['variants_array']);
            }

            // FAQs
            if (!empty($validated['faqs'])) {
                $faqs = json_decode($validated['faqs'], true);
                if (is_array($faqs)) {
                    foreach ($faqs as $faq) {
                        $product->faqs()->create([
                            'question' => $faq['question'] ?? 'Q',
                            'answer' => $faq['answer'] ?? 'A',
                        ]);
                    }
                }
            }

            // Reviews
            if (!empty($validated['reviews_array'])) {
                $reviews = json_decode($validated['reviews_array'], true);
                if (is_array($reviews)) {
                    foreach ($reviews as $i => $review) {
                        $createdReview = $product->allReviews()->create([
                            'reviewer_name' => $review['reviewer_name'] ?? 'Guest',
                            'rating' => isset($review['rating']) ? (int)$review['rating'] : 5,
                            'body' => $review['comment'] ?? '',
                            'created_at' => $review['date'] ?? now(),
                            'is_approved' => true,
                            'approved_at' => now(),
                        ]);
                        // Handle review photo upload
                        $fileKey = "review_photos_{$i}";
                        if ($request->hasFile($fileKey)) {
                            $file = $request->file($fileKey);
                            $path = $file->store('reviews', 'public');
                            $createdReview->images()->create([
                                'url' => '/storage/' . $path,
                            ]);
                        }
                    }
                }
            }

            // Images
            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $i => $file) {
                    $path = $file->store('products', 'public');
                    $product->images()->create([
                        'url' => '/storage/' . $path,
                        'alt' => $product->name,
                        'sort_order' => $i,
                        'is_primary' => $i === 0
                    ]);
                }
            }
            
            // Ingredients
            if (!empty($validated['manual_ingredients'])) {
                $manualIngredients = json_decode($validated['manual_ingredients'], true);
                if (is_array($manualIngredients)) {
                    foreach ($manualIngredients as $i => $ing) {
                        $imageUrl = null;
                        if ($request->hasFile("ingredient_images_{$i}")) {
                            $path = $request->file("ingredient_images_{$i}")->store('ingredients', 'public');
                            $imageUrl = '/storage/' . $path;
                        }
                        $ingredient = \App\Models\Ingredient::firstOrCreate(
                            ['name' => $ing['name']],
                            ['image_url' => $imageUrl]
                        );
                        $product->ingredientItems()->attach($ingredient->id);
                    }
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            return response()->json(['data' => new ProductDetailResource($product->load(['brand', 'category', 'images', 'sizes', 'variants']))], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Failed to create product.', 'error' => $e->getMessage()], 500);
        }
    }

    /**
     * GET /api/v1/admin/products/{product}
     */
    public function show(Product $product): JsonResponse
    {
        $product->load(['brand', 'category', 'images', 'sizes', 'variants', 'allReviews.images', 'ingredientItems', 'faqs', 'productType']);
        return response()->json(['data' => new ProductDetailResource($product)]);
    }

    /**
     * PUT /api/v1/admin/products/{product}
     */
    public function update(UpdateProductRequest $request, Product $product): JsonResponse
    {
        \Illuminate\Support\Facades\DB::beginTransaction();
        try {
            $validated = $request->validated();

            // Update basic product fields (removes relationship keys from validated first)
            $basicFields = array_diff_key($validated, array_flip([
                'variants', 'variants_array', 'faqs', 'reviews_array', 'deleted_review_ids',
                'manual_ingredients', 'deleted_image_ids',
            ]));
            $product->update($basicFields);

            // ── Sync Variants — syncVariants() also updates products.price / original_price ──
            if (array_key_exists('variants_array', $validated) && is_array($validated['variants_array'])) {
                $variantService = new \App\Services\VariantService();
                $variantService->syncVariants($product, $validated['variants_array']);
            }

            // ── Sync FAQs ──────────────────────────────────────────────────────
            if (array_key_exists('faqs', $validated)) {
                $faqs = json_decode($validated['faqs'], true);
                if (is_array($faqs)) {
                    $incomingIds = array_filter(array_column($faqs, 'id'));
                    // Delete FAQs not present in incoming list
                    $product->faqs()->whereNotIn('id', $incomingIds ?: [0])->delete();
                    foreach ($faqs as $faq) {
                        if (!empty($faq['id'])) {
                            $product->faqs()->where('id', (int) $faq['id'])->update([
                                'question' => $faq['question'] ?? 'Q',
                                'answer'   => $faq['answer'] ?? 'A',
                            ]);
                        } else {
                            $product->faqs()->create([
                                'question' => $faq['question'] ?? 'Q',
                                'answer'   => $faq['answer'] ?? 'A',
                            ]);
                        }
                    }
                }
            }

            // ── Delete Reviews ────────────────────────────────────────────────
            if (!empty($validated['deleted_review_ids'])) {
                $deletedIds = json_decode($validated['deleted_review_ids'], true);
                if (is_array($deletedIds)) {
                    $product->allReviews()->whereIn('id', array_map('intval', $deletedIds))->delete();
                }
            }

            // ── Add new Reviews ───────────────────────────────────────────────
            if (!empty($validated['reviews_array'])) {
                $reviewsData = json_decode($validated['reviews_array'], true);
                if (is_array($reviewsData)) {
                    foreach ($reviewsData as $i => $review) {
                        if (empty($review['id'])) {
                            $createdReview = $product->allReviews()->create([
                                'reviewer_name' => $review['reviewer_name'] ?? 'Guest',
                                'rating'        => isset($review['rating']) ? (int) $review['rating'] : 5,
                                'body'          => $review['comment'] ?? '',
                                'created_at'    => $review['date'] ?? now(),
                                'is_approved'   => true,
                                'approved_at'   => now(),
                            ]);
                            // Handle review photo upload
                            $fileKey = "review_photos_{$i}";
                            if ($request->hasFile($fileKey)) {
                                $file = $request->file($fileKey);
                                $path = $file->store('reviews', 'public');
                                $createdReview->images()->create([
                                    'url' => '/storage/' . $path,
                                ]);
                            }
                        }
                    }
                }
            }

            // ── Delete specified images ───────────────────────────────────────
            if (!empty($validated['deleted_image_ids'])) {
                $deletedIds = json_decode($validated['deleted_image_ids'], true);
                if (is_array($deletedIds)) {
                    ProductImage::where('product_id', $product->id)
                        ->whereIn('id', array_map('intval', $deletedIds))
                        ->each(function ($img) {
                            \Illuminate\Support\Facades\Storage::disk('public')
                                ->delete(ltrim(str_replace('/storage/', '', $img->url), '/'));
                            $img->delete();
                        });
                }
            }

            // ── Upload new images ─────────────────────────────────────────────
            if ($request->hasFile('images')) {
                $maxSort = (int) $product->images()->max('sort_order');
                foreach ($request->file('images') as $i => $file) {
                    $path     = $file->store('products', 'public');
                    $noPrimary = $product->images()->count() === 0 && $i === 0;
                    $product->images()->create([
                        'url'        => '/storage/' . $path,
                        'alt'        => $product->name,
                        'sort_order' => $maxSort + $i + 1,
                        'is_primary'  => $noPrimary,
                    ]);
                }
            }

            // Ensure at least one primary image
            if ($product->images()->where('is_primary', true)->count() === 0) {
                $first = $product->images()->orderBy('sort_order')->first();
                if ($first) {
                    $first->update(['is_primary' => true]);
                }
            }

            // ── Sync Ingredients ──────────────────────────────────────────────
            if (array_key_exists('manual_ingredients', $validated)) {
                $manualIngredients = json_decode($validated['manual_ingredients'], true);
                if (is_array($manualIngredients)) {
                    $product->ingredientItems()->detach();
                    foreach ($manualIngredients as $i => $ing) {
                        $imageUrl = null;
                        if ($request->hasFile("ingredient_images_{$i}")) {
                            $path     = $request->file("ingredient_images_{$i}")->store('ingredients', 'public');
                            $imageUrl = '/storage/' . $path;
                        }
                        $ingredient = \App\Models\Ingredient::firstOrCreate(
                            ['name' => $ing['name']],
                            ['image_url' => $imageUrl]
                        );
                        if ($imageUrl && !$ingredient->wasRecentlyCreated) {
                            $ingredient->update(['image_url' => $imageUrl]);
                        }
                        $product->ingredientItems()->attach($ingredient->id);
                    }
                }
            }

            \Illuminate\Support\Facades\DB::commit();

            $product->load(['brand', 'category', 'images', 'sizes', 'variants', 'allReviews.images', 'ingredientItems', 'faqs', 'productType']);
            return response()->json(['data' => new ProductDetailResource($product)]);

        } catch (\Exception $e) {
            \Illuminate\Support\Facades\DB::rollBack();
            return response()->json(['message' => 'Failed to update product.', 'error' => $e->getMessage()], 500);
        }
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
