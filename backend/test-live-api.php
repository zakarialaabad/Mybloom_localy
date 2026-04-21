<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Testing\TestResponse;
use Illuminate\Support\Facades\Route;

// Create a fake request to the API
$response = \Illuminate\Support\Facades\Http::get('http://127.0.0.1:8000/api/v1/products?limit=1');

if ($response->successful()) {
    $data = $response->json();
    echo "API Response (first product):\n";
    echo json_encode($data['data'][0] ?? [], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
} else {
    echo "API Error: " . $response->status() . "\n";
    echo $response->body() . "\n";
}
?>
