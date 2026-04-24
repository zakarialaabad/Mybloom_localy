<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Support\Facades\DB;

echo "=== Musc Product Images Verification ===\n\n";

// Check if Musc products exist
$muscProducts = DB::table('products')->whereIn('id', [86, 87, 88])->get(['id', 'name']);
echo "Musc Products in DB: " . $muscProducts->count() . "\n";
foreach ($muscProducts as $p) {
    echo "  - ID {$p->id}: {$p->name}\n";
}

echo "\n";

// Check images
$images = DB::table('product_images')->whereIn('product_id', [86, 87, 88])->get();
echo "Musc Product Images in DB: " . $images->count() . "\n";
foreach ($images as $img) {
    echo "  - Product {$img->product_id}: {$img->url}\n";
}

echo "\n";

// Check if Musc image files exist
echo "Checking if image files exist:\n";
$filePaths = [
    '/images/musc blanc/musc-blanc-img_main.jpg',
    '/images/musc grenade/musc-a-la-grenade-img_main.jpg',
    '/images/musc de féminité/musc-de-feminite-img_main.jpg',
];

foreach ($filePaths as $path) {
    $fullPath = base_path('../frontend/Public') . str_replace('/', DIRECTORY_SEPARATOR, $path);
    $exists = file_exists($fullPath) ? '✓' : '✗';
    echo "  $exists $path\n";
}

echo "\nTotal images in database: " . DB::table('product_images')->count() . "\n";
?>
