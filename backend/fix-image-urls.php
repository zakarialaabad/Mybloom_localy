<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "Fixing image URLs in database...\n\n";

// Fix product images
$productImages = DB::table('product_images')->where('url', 'not like', '/storage/%')->get();
$fixed = 0;
foreach ($productImages as $img) {
    if ($img->url && !str_starts_with($img->url, '/storage/')) {
        $newUrl = '/storage/' . $img->url;
        DB::table('product_images')->where('id', $img->id)->update(['url' => $newUrl]);
        $fixed++;
    }
}
echo "✓ Fixed $fixed product image URLs\n";

// Fix ingredient images  
$ingredients = DB::table('ingredients')->where('image_url', 'not like', '/storage/%')->where('image_url', '!=', null)->get();
$fixed = 0;
foreach ($ingredients as $ing) {
    if ($ing->image_url && !str_starts_with($ing->image_url, '/storage/')) {
        $newUrl = '/storage/' . $ing->image_url;
        DB::table('ingredients')->where('id', $ing->id)->update(['image_url' => $newUrl]);
        $fixed++;
    }
}
echo "✓ Fixed $fixed ingredient image URLs\n";

echo "\nVerifying fixes...\n";
$checkProduct = DB::table('product_images')->first();
if ($checkProduct) {
    echo "Sample product image URL: " . $checkProduct->url . "\n";
}
$checkIng = DB::table('ingredients')->where('image_url', '!=', null)->first();
if ($checkIng) {
    echo "Sample ingredient image URL: " . $checkIng->image_url . "\n";
}

echo "\n✅ All image URLs have been fixed!\n";
?>
