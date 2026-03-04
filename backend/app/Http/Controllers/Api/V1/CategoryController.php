<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class CategoryController extends Controller
{
    /**
     * GET /api/v1/categories
     * Returns top-level categories with their children.
     *
     * Cached for 10 minutes. Categories change rarely.
     * Cache is busted automatically on TTL expiry, or manually via
     * Cache::forget('api.categories') after an admin creates/updates a category.
     */
    public function index(): AnonymousResourceCollection
    {
        $categories = Cache::remember('api.categories', now()->addMinutes(10), function () {
            return Category::with('children')
                ->whereNull('parent_id')
                ->orderBy('sort_order')
                ->get();
        });

        return CategoryResource::collection($categories);
    }
}
