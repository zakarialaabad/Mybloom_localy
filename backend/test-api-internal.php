<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Foundation\Testing\TestCase;
use Illuminate\Http\Request;

// Manually test the product endpoint
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

// Create a test request
$request = Request::create('/api/v1/products?limit=1', 'GET');
$response = $kernel->handle($request);

// Get the response content
$content = $response->getContent();
$data = json_decode($content, true);

if (isset($data['data'][0])) {
    echo "API Response - First Product:\n";
    $product = $data['data'][0];
    echo "  Name: " . ($product['name'] ?? 'N/A') . "\n";
    echo "  Primary Image: " . ($product['primary_image'] ?? 'NULL/MISSING') . "\n";
    
    if (isset($product['images']) && is_array($product['images'])) {
        echo "  Images Array:\n";
        foreach (array_slice($product['images'], 0, 2) as $img) {
            echo "    - " . ($img['image_url'] ?? 'NULL') . "\n";
        }
    } else {
        echo "  Images: NOT IN RESPONSE\n";
    }
} else {
    echo "Error getting products. Response:\n";
    echo $content . "\n";
}

echo "\n\nAPI Response - Ingredients:\n";
$request2 = Request::create('/api/v1/ingredients', 'GET');
$response2 = $kernel->handle($request2);
$content2 = $response2->getContent();
$data2 = json_decode($content2, true);

if (isset($data2['data'])) {
    $ings = array_slice($data2['data'], 0, 2);
    foreach ($ings as $ing) {
        echo "  " . ($ing['name'] ?? 'N/A') . ": " . ($ing['image_url'] ?? 'NULL') . "\n";
    }
}
?>
