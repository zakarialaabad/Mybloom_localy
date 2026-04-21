<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use App\Utilities\ImageUrlResolver;
use Illuminate\Support\Facades\DB;

echo "Testing ImageUrlResolver with different URL formats:\n\n";

// Test 1: Relative path (old format)
$oldFormat = 'products/B8YlVHHvSffaZuOjdSBWupMIefVGPJNk.webp';
$resolved1 = ImageUrlResolver::resolve($oldFormat);
echo "1. Old format (relative): $oldFormat\n";
echo "   Resolved to: $resolved1\n\n";

// Test 2: Full path with /storage/ (new format)
$newFormat = '/storage/products/B8YlVHHvSffaZuOjdSBWupMIefVGPJNk.webp';
$resolved2 = ImageUrlResolver::resolve($newFormat);
echo "2. New format (with /storage/): $newFormat\n";
echo "   Resolved to: $resolved2\n\n";

// Test 3: What's actually in database for products
$productImages = DB::table('product_images')->limit(3)->get();
echo "3. Actual product image URLs in database:\n";
foreach ($productImages as $img) {
    $resolved = ImageUrlResolver::resolve($img->url);
    echo "   DB: $img->url\n";
    echo "   → Resolved: $resolved\n";
}

echo "\n4. Actual ingredient image URLs in database:\n";
$ingredients = DB::table('ingredients')->where('image_url', '!=', null)->limit(3)->get();
foreach ($ingredients as $ing) {
    $resolved = ImageUrlResolver::resolve($ing->image_url);
    echo "   DB: $ing->image_url\n";
    echo "   → Resolved: $resolved\n";
}

echo "\n5. Config app.url: " . config('app.url') . "\n";
?>
