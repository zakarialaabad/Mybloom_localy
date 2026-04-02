<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Ingredient;
use Illuminate\Support\Facades\Cache;

class IngredientController extends Controller
{
    public function index()
    {
        $ingredients = Cache::remember('api.ingredients', 600, function () {
            return Ingredient::orderBy('name')->get(['id', 'name', 'image_url']);
        });

        return response()->json(['data' => $ingredients]);
    }
}
