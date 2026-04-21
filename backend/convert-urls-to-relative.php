<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Converting image URLs from /storage/ format to relative format...\n\n";

// Fix product images - remove /storage/ prefix
$productImages = DB::table('product_images')->where('url', 'like', '/storage/%')->get();
$fixed = 0;
foreach ($productImages as $img) {
    // Remove /storage/ prefix
    $newUrl = str_replace('/storage/', '', $img->url);
    DB::table('product_images')->where('id', $img->id)->update(['url' => $newUrl]);
    $fixed++;
}
echo "✓ Converted $fixed product image URLs to relative format\n";

// Fix ingredient images - remove /storage/ prefix
$ingredients = DB::table('ingredients')->where('image_url', 'like', '/storage/%')->get();
$fixed = 0;
foreach ($ingredients as $ing) {
    // Remove /storage/ prefix
    $newUrl = str_replace('/storage/', '', $ing->image_url);
    DB::table('ingredients')->where('id', $ing->id)->update(['image_url' => $newUrl]);
    $fixed++;
}
echo "✓ Converted $fixed ingredient image URLs to relative format\n";

echo "\nVerifying converted URLs...\n";
$checkProduct = DB::table('product_images')->where('url', 'like', 'products/%')->first();
if ($checkProduct) {
    echo "✓ Product image: " . $checkProduct->url . "\n";
}
$checkIng = DB::table('ingredients')->where('image_url', 'like', 'ingredients/%')->first();
if ($checkIng) {
    echo "✓ Ingredient image: " . $checkIng->image_url . "\n";
}

echo "\n✅ All URLs converted to relative format!\n";
?>
