<?php
function testUrl($url) {
    echo "Testing: $url\n";
    
    $context = stream_context_create([
        'http' => [
            'ignore_errors' => true,
            'timeout' => 3
        ]
    ]);
    
    $response = @file_get_contents($url, false, $context);
    
    // Check headers
    if (isset($http_response_header)) {
        echo "Status: " . $http_response_header[0] . "\n";
        foreach ($http_response_header as $header) {
            if (stripos($header, 'content-type') === 0) {
                echo "Header: $header\n";
            }
        }
    }
    
    if ($response === false) {
        echo "Error: No response\n";
    } else {
        echo "Response length: " . strlen($response) . "\n";
        if (strlen($response) > 0) {
            $first20 = bin2hex(substr($response, 0, 20));
            echo "First 20 bytes (hex): $first20\n";
            $isHtml = strpos($response, '<!DOCTYPE') === 0 || strpos($response, '<html') === 0;
            echo "Is HTML: " . ($isHtml ? 'YES' : 'NO') . "\n";
        }
    }
    echo "\n";
}

testUrl('http://localhost:8000/test-route');
testUrl('http://localhost:8000/api/v1/products');
testUrl('http://localhost:8000/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp');
?>
