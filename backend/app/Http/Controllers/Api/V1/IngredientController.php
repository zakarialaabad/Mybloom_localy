<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use App\Services\ImageService;
use App\Utilities\ImageUrlResolver;
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

    public function store(Request $request)
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

        Cache::forget('api.ingredients');

        return response()->json(['data' => $ingredient], 201);
    }
}
