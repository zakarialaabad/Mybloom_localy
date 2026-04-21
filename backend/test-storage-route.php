<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

use Illuminate\Foundation\Testing\TestRequest;
use Illuminate\Http\Request;

// Create a test request to the storage route
$request = Request::create('/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp', 'GET');
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
$response = $kernel->handle($request);

// Check the response
$statusCode = $response->getStatusCode();
$contentType = $response->headers->get('Content-Type');
$contentLength = $response->headers->get('Content-Length');

echo "Route Test Results:\n";
echo "  URL: /storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp\n";
echo "  HTTP Status: $statusCode\n";
echo "  Content-Type: $contentType\n";
echo "  Content-Length: $contentLength\n";
echo "\n";

if ($statusCode === 200) {
    echo "✅ File is being served successfully!\n";
} else {
    echo "❌ Failed to serve file (HTTP $statusCode)\n";
    echo "Response: " . substr((string)$response->getContent(), 0, 200) . "\n";
}

$kernel->terminate($request, $response);
?>
