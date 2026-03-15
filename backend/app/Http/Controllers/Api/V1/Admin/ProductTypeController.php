<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductType;
use Illuminate\Http\JsonResponse;

class ProductTypeController extends Controller
{
    /**
     * GET /api/v1/admin/product-types
     * Returns all product types ordered by sort_order.
     */
    public function index(): JsonResponse
    {
        $types = ProductType::orderBy('sort_order')->get(['id', 'name', 'slug', 'sort_order']);

        return response()->json(['data' => $types]);
    }
}
