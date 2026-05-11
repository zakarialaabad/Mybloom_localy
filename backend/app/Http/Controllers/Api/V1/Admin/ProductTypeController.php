<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ProductTypeController extends Controller
{
    public function index(): JsonResponse
    {
        $types = ProductType::withCount('products')->orderBy('sort_order')->get();

        return response()->json(['data' => $types]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', 'unique:product_types,name'],
        ]);

        $data['slug']       = Str::slug($data['name']);
        $data['sort_order'] = (ProductType::max('sort_order') ?? 0) + 1;

        $type = ProductType::create($data);
        $type->loadCount('products');

        return response()->json(['data' => $type], 201);
    }

    public function update(Request $request, ProductType $productType): JsonResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:100', "unique:product_types,name,{$productType->id}"],
        ]);

        $data['slug'] = Str::slug($data['name']);
        $productType->update($data);
        $productType->loadCount('products');

        return response()->json(['data' => $productType]);
    }

    public function destroy(ProductType $productType): JsonResponse
    {
        $productType->delete();

        return response()->json(['message' => 'Product type deleted.']);
    }
}
