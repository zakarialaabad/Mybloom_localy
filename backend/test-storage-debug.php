<?php
use Illuminate\Http\Request;

require 'vendor/autoload.php';

// Enable debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

try {
    $app = require_once 'bootstrap/app.php';
    $app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

    // Create a test request
    $request = Request::create('/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp', 'GET');
    $kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);
    
    $response = $kernel->handle($request);

    echo "Status: " . $response->getStatusCode() . "\n";
    echo "Content-Type: " . $response->headers->get('Content-Type') . "\n";
    
    if ($response->getStatusCode() >= 400) {
        echo "\nError Response:\n";
        echo substr((string)$response->getContent(), 0, 500) . "\n";
    }

} catch (\Exception $e) {
    echo "Exception: " . $e->getMessage() . "\n";
    echo "File: " . $e->getFile() . ":" . $e->getLine() . "\n";
    echo "Trace:\n";
    echo $e->getTraceAsString() . "\n";
}
?>
