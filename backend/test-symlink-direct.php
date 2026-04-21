<?php
// Simple test to verify symlink serving
$url = 'http://localhost:8000/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp';

echo "Testing URL: $url\n";
echo "Creating stream context...\n";

$context = stream_context_create([
    'http' => [
        'timeout' => 5,
        'ignore_errors' => true
    ]
]);

echo "Making HTTP request...\n";
$response = @file_get_contents($url, false, $context);

if ($response === false) {
    echo "Error: Could not fetch URL\n";
    if (isset($http_response_header)) {
        echo "Headers: " . implode(", ", $http_response_header) . "\n";
    }
} else {
    echo "Success! Content length: " . strlen($response) . " bytes\n";
    echo "First 20 bytes (hex): " . bin2hex(substr($response, 0, 20)) . "\n";
}
?>
