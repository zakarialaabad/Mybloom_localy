<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ShippingMethodResource;
use App\Models\ShippingMethod;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ShippingMethodController extends Controller
{
    /**
     * GET /api/v1/shipping-methods
     */
    public function index(): AnonymousResourceCollection
    {
        $methods = ShippingMethod::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return ShippingMethodResource::collection($methods);
    }
}
