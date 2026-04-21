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
        echo "Status: " . trim($http_response_header[0]) . "\n";
    }
    
    if ($response === false || strlen($response) === 0) {
        echo "Error: No response\n";
    } else {
        echo "Response length: " . strlen($response) . " bytes\n";
        $isHtml = strpos($response, '<!DOCTYPE') === 0 || strpos($response, '<html') === 0;
        $isJson = strpos($response, '{') === 0;
        if ($isJson) echo "Format: JSON\n";
        elseif ($isHtml) echo "Format: HTML (ERROR PAGE)\n";
        else echo "Format: Binary (likely image)\n";
    }
    echo "\n";
}

testUrl('http://localhost:8000/api/test-route');
testUrl('http://localhost:8000/api/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp');
testUrl('http://localhost:8000/api/v1/products?limit=1');
?>
