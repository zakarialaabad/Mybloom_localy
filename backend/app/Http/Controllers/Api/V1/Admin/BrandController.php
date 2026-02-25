<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\BrandResource;
use App\Models\Brand;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

class BrandController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return BrandResource::collection(Brand::withCount('products')->orderBy('name')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['required', 'string', 'max:100', 'unique:brands,name'],
            'logo_url' => ['nullable', 'url', 'max:500'],
        ]);

        $data['slug'] = Str::slug($data['name']);
        $brand = Brand::create($data);

        return response()->json(['data' => new BrandResource($brand)], 201);
    }

    public function show(Brand $brand): JsonResponse
    {
        return response()->json(['data' => new BrandResource($brand->loadCount('products'))]);
    }

    public function update(Request $request, Brand $brand): JsonResponse
    {
        $data = $request->validate([
            'name'     => ['sometimes', 'string', 'max:100', "unique:brands,name,{$brand->id}"],
            'logo_url' => ['nullable', 'url', 'max:500'],
        ]);

        if (isset($data['name'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $brand->update($data);

        return response()->json(['data' => new BrandResource($brand)]);
    }

    public function destroy(Brand $brand): JsonResponse
    {
        $brand->delete();

        return response()->json(['message' => 'Brand deleted.']);
    }
}
