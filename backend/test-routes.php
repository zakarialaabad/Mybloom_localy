<?php
$url1 = 'http://localhost:8000/test-route';
$url2 = 'http://localhost:8000/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp';

echo "Test 1: /test-route\n";
$response1 = @file_get_contents($url1);
echo "Content: " . substr($response1, 0, 100) . "\n\n";

echo "Test 2: /storage/...\n";
$response2 = @file_get_contents($url2);
echo "Length: " . strlen($response2) . "\n";
echo "First 50 chars: " . substr($response2, 0, 50) . "\n";
echo "HTML check: " . (strpos($response2, '<!DOCTYPE') === 0 ? 'YES (HTML)' : 'NO (Binary)') . "\n";
?>
