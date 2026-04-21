<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Http\Request;

// Test 1: Simple route
$request = Request::create('/test', 'GET');
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request);

echo "Test 1 - Simple Route:\n";
echo "  Status: " . $response->getStatusCode() . "\n";
echo "  Content: " . $response->getContent() . "\n\n";

// Test 2: Storage route
$request2 = Request::create('/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp', 'GET');
$response2 = $kernel->handle($request2);

echo "Test 2 - Storage Route:\n";
echo "  Status: " . $response2->getStatusCode() . "\n";
echo "  Content-Type: " . $response2->headers->get('Content-Type') . "\n";
if ($response2->getStatusCode() >= 400) {
    echo "  Error: " . substr($response2->getContent(), 0, 200) . "\n";
} else {
    echo "  Size: " . strlen($response2->getContent()) . " bytes\n";
}
?>
