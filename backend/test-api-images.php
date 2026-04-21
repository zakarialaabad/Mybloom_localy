<?php
// Test API response
$curl = curl_init('http://localhost:8000/api/v1/products?limit=1');
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 5,
]);

$response = curl_exec($curl);
$info = curl_getinfo($curl);
curl_close($curl);

echo "Testing: http://localhost:8000/api/v1/products?limit=1\n";
echo "HTTP Code: " . $info['http_code'] . "\n\n";

if ($info['http_code'] === 200) {
    $data = json_decode($response, true);
    
    if (isset($data['data'][0])) {
        $product = $data['data'][0];
        echo "Product: " . $product['name'] . "\n";
        echo "Main Image URL: " . $product['main_image'] . "\n\n";
        
        // Check if URL has correct prefix
        if (strpos($product['main_image'], '/api/storage/') !== false) {
            echo "✓ URL has correct /api/storage/ prefix\n";
        } else {
            echo "✗ URL does NOT have /api/storage/ prefix\n";
        }
        
        // Test if we can fetch the image
        echo "\nTesting image fetch...\n";
        $imgCurl = curl_init($product['main_image']);
        curl_setopt_array($imgCurl, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_TIMEOUT => 5,
            CURLOPT_BINARYTRANSFER => true,
        ]);
        
        $imgResponse = curl_exec($imgCurl);
        $imgInfo = curl_getinfo($imgCurl);
        curl_close($imgCurl);
        
        echo "Image HTTP Code: " . $imgInfo['http_code'] . "\n";
        echo "Image Size: " . strlen($imgResponse) . " bytes\n";
        echo "Content-Type: " . $imgInfo['content_type'] . "\n";
        
        if ($imgInfo['http_code'] === 200 && strlen($imgResponse) > 0) {
            echo "✓ Image successfully fetched!\n";
        }
    }
}
?>
