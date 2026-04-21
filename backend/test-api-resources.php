<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;
use App\Http\Resources\ProductResource;
use App\Models\Product;

echo "Testing actual API resources...\n\n";

// Get a product and show what the resource returns
$product = Product::with(['images', 'brand', 'category', 'variants', 'reviews', 'ingredientItems'])
    ->withAvg('reviews as avg_rating', 'rating')
    ->withCount('reviews as review_count')
    ->first();

if ($product) {
    echo "Product: " . $product->name . "\n";
    echo "Image count: " . count($product->images) . "\n";
    
    // Transform using ProductResource
    $resource = new ProductResource($product);
    $data = $resource->resolve(\Illuminate\Http\Request::create('/'));
    
    echo "Resource data:\n";
    echo "  Image URL from resource: " . ($data['image'] ?? 'NO IMAGE') . "\n";
    
    if (isset($data['images']) && is_array($data['images'])) {
        echo "  Images array (first 3):\n";
        foreach (array_slice($data['images'], 0, 3) as $img) {
            echo "    - " . $img . "\n";
        }
    }
}

echo "\n\nChecking ingredients endpoint...\n";
$ingredients = DB::table('ingredients')->where('image_url', '!=', null)->limit(2)->get();
foreach ($ingredients as $ing) {
    echo "Ingredient: " . $ing->name . "\n";
    echo "  DB image_url: " . $ing->image_url . "\n";
    
    // Test what the ingredient controller returns
    $resolved = \App\Utilities\ImageUrlResolver::resolve($ing->image_url);
    echo "  Resolved URL: " . $resolved . "\n";
}
?>
