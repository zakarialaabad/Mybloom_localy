<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\Cache;

class BrandController extends Controller
{
    /**
     * GET /api/v1/brands
     *
     * Cached for 10 minutes. Brands change rarely.
     * Cache is busted automatically on TTL expiry, or manually via
     * Cache::forget('api.brands') after an admin creates/updates a brand.
     */
    public function index(): AnonymousResourceCollection
    {
        $brands = Cache::remember('api.brands', now()->addMinutes(10), function () {
            return Brand::withCount(['products' => fn ($q) => $q->where('is_active', true)])
                ->orderBy('name')
                ->get();
        });

        return BrandResource::collection($brands);
    }
}
