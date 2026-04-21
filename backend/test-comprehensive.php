<?php
echo "=== COMPREHENSIVE IMAGE SERVING TEST ===\n\n";

// Test 1: Product images
echo "Test 1: Fetching product image from API\n";
$productCurl = curl_init('http://localhost:8000/api/v1/products/kalimat');
curl_setopt_array($productCurl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]);
$productData = json_decode(curl_exec($productCurl), true);
curl_close($productCurl);

$imageUrl = $productData['primary_image'] ?? null;
echo "Image URL from API: $imageUrl\n";

if ($imageUrl) {
    $imgCurl = curl_init($imageUrl);
    curl_setopt_array($imgCurl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_BINARYTRANSFER => true,
    ]);
    $imgData = curl_exec($imgCurl);
    $imgInfo = curl_getinfo($imgCurl);
    curl_close($imgCurl);
    
    echo "Status: " . $imgInfo['http_code'] . "\n";
    echo "Content-Type: " . $imgInfo['content_type'] . "\n";
    echo "Size: " . strlen($imgData) . " bytes\n";
    echo ($imgInfo['http_code'] === 200 ? "✓ PASS" : "✗ FAIL") . "\n";
}

echo "\nTest 2: Ingredient images\n";
$ingCurl = curl_init('http://localhost:8000/api/v1/ingredients?limit=1');
curl_setopt_array($ingCurl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]);
$ingData = json_decode(curl_exec($ingCurl), true);
curl_close($ingCurl);

if (isset($ingData['data'][0])) {
    $ing = $ingData['data'][0];
    echo "Ingredient: " . ($ing['name'] ?? 'N/A') . "\n";
    echo "Image URL: " . ($ing['image_url'] ?? 'N/A') . "\n";
    
    if ($ing['image_url'] ?? false) {
        $imgCurl = curl_init($ing['image_url']);
        curl_setopt_array($imgCurl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 5,
            CURLOPT_BINARYTRANSFER => true,
        ]);
        $imgData = curl_exec($imgCurl);
        $imgInfo = curl_getinfo($imgCurl);
        curl_close($imgCurl);
        
        echo "Status: " . $imgInfo['http_code'] . "\n";
        echo "Content-Type: " . $imgInfo['content_type'] . "\n";
        echo "Size: " . strlen($imgData) . " bytes\n";
        echo ($imgInfo['http_code'] === 200 ? "✓ PASS" : "✗ FAIL") . "\n";
    }
}

echo "\n=== ALL TESTS COMPLETE ===\n";
?>
