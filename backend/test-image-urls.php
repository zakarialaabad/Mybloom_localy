<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$product = \App\Models\Product::with('images')->first();
if ($product) {
    echo "Product: {$product->name}\n";
    echo "Images count: " . count($product->images) . "\n";
    foreach ($product->images as $img) {
        echo "URL: {$img->url}\n";
        echo "  File exists at: " . (file_exists(base_path("public/{$img->url}")) ? "YES" : "NO") . "\n";
    }
} else {
    echo "No products found\n";
}
?>
