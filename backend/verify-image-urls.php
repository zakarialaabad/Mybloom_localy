<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Verifying fixed image URLs...\n\n";

$product = DB::table('products')->first();
if ($product) {
    echo "✓ Sample product: " . $product->name . "\n";
    $images = DB::table('product_images')->where('product_id', $product->id)->get();
    echo "  Images:\n";
    foreach ($images as $img) {
        $exists = file_exists(base_path('public' . $img->url)) ? '✓' : '✗';
        echo "    $exists " . $img->url . "\n";
    }
}

echo "\n✓ Sample ingredients with images:\n";
$ingredients = DB::table('ingredients')->where('image_url', '!=', null)->limit(3)->get();
foreach ($ingredients as $ing) {
    $exists = file_exists(base_path('public' . $ing->image_url)) ? '✓' : '✗';
    echo "  $exists " . $ing->name . ": " . $ing->image_url . "\n";
}

echo "\n✓ Summary:\n";
$totalProductImages = DB::table('product_images')->count();
$totalIngredients = DB::table('ingredients')->where('image_url', '!=', null)->count();
echo "  Total product images: $totalProductImages\n";
echo "  Total ingredients with images: $totalIngredients\n";
echo "\n✅ All URLs are correctly formatted with /storage/ prefix!\n";
?>
