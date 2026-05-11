<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Services\ImageService;
use App\Utilities\ImageUrlResolver;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class IngredientController extends Controller
{
    public function __construct(private ImageService $imageService) {}

    public function index()
    {
        $ingredients = Cache::remember('api.ingredients.v2', 600, function () {
            return Ingredient::withCount('products')->orderBy('name')->get();
        });

        $resolved = $ingredients->map(fn ($ing) => [
            'id'             => $ing->id,
            'name'           => $ing->name,
            'slug'           => Str::slug($ing->name),
            'image_url'      => ImageUrlResolver::resolve($ing->image_url),
            'products_count' => $ing->products_count,
        ]);

        return response()->json(['data' => $resolved]);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name'  => 'required|string|max:100',
            'image' => 'nullable|image|max:3072',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $result = $this->imageService->process($request->file('image'), 'ingredients');
            $imageUrl = $result->relativePath;
        }

        $ingredient = Ingredient::create([
            'name'      => $request->name,
            'image_url' => $imageUrl,
        ]);

        Cache::forget('api.ingredients.v2');

        return response()->json(['data' => $this->format($ingredient)], 201);
    }

    public function update(Request $request, Ingredient $ingredient): JsonResponse
    {
        $request->validate([
            'name'  => "required|string|max:100|unique:ingredients,name,{$ingredient->id}",
            'image' => 'nullable|image|max:3072',
        ]);

        $data = ['name' => $request->name];

        if ($request->hasFile('image')) {
            $result = $this->imageService->process($request->file('image'), 'ingredients');
            $data['image_url'] = $result->relativePath;
        }

        $ingredient->update($data);
        $ingredient->loadCount('products');

        Cache::forget('api.ingredients.v2');

        return response()->json(['data' => $this->format($ingredient)]);
    }

    public function destroy(Ingredient $ingredient): JsonResponse
    {
        $ingredient->delete();
        Cache::forget('api.ingredients.v2');

        return response()->json(['message' => 'Ingredient deleted.']);
    }

    private function format(Ingredient $ingredient): array
    {
        return [
            'id'             => $ingredient->id,
            'name'           => $ingredient->name,
            'slug'           => Str::slug($ingredient->name),
            'image_url'      => ImageUrlResolver::resolve($ingredient->image_url),
            'products_count' => $ingredient->products_count ?? 0,
        ];
    }
}
