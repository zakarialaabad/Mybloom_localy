#!/usr/bin/env php
<?php
/**
 * Test script to verify the is_gift filter works at the API level
 * Run: php backend/test-is-gift-filter.php
 */

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/bootstrap/app.php';

use Illuminate\Http\Request;
use App\Http\Controllers\Api\V1\ProductController;

$app = require_once __DIR__ . '/bootstrap/app.php';

// Create a fake request with is_gift=true
$request = Request::create('/api/v1/products?is_gift=1', 'GET');

echo "Testing is_gift filter...\n";
echo "URL: " . $request->getRequestUri() . "\n";
echo "Query params: " . json_encode($request->query()) . "\n";
echo "is_gift filled?: " . ($request->filled('is_gift') ? 'YES' : 'NO') . "\n";
echo "\n";

// Test the controller
$controller = new ProductController();
try {
    $response = $controller->index($request);
    $data = $response->resolve();
    
    echo "API Response:\n";
    echo "  Total products: " . count($data['data']) . "\n";
    
    if (count($data['data']) > 0) {
        echo "  Sample products:\n";
        foreach (array_slice($data['data'], 0, 3) as $product) {
            echo "    - " . $product['name'] . " (is_gift: " . ($product['is_gift'] ? 'true' : 'false') . ")\n";
        }
    }
} catch (\Exception $e) {
    echo "ERROR: " . $e->getMessage() . "\n";
}
