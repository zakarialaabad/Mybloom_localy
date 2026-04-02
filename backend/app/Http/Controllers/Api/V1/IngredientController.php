<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

class IngredientController extends Controller
{
    public function index()
    {
        $ingredients = Cache::remember('api.ingredients', 600, function () {
            return Ingredient::orderBy('name')->get(['id', 'name', 'image_url']);
        });

        return response()->json(['data' => $ingredients]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name'  => 'required|string|max:100',
            'image' => 'nullable|image|max:3072',
        ]);

        $imageUrl = null;
        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('ingredients', 'public');
            $imageUrl = '/storage/' . $path;
        }

        $ingredient = Ingredient::create([
            'name'      => $request->name,
            'image_url' => $imageUrl,
        ]);

        Cache::forget('api.ingredients');

        return response()->json(['data' => $ingredient], 201);
    }
}
