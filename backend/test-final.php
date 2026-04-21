<?php
echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  FINAL COMPREHENSIVE IMAGE SERVING TEST                    ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n\n";

$tests = [];

// Test 1: Product list images
echo "Test 1: Product List Images\n";
echo "─────────────────────────────\n";
$curl = curl_init('http://localhost:8000/api/v1/products?limit=1');
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]);
$response = curl_exec($curl);
$data = json_decode($response, true);
curl_close($curl);

if (isset($data['data'][0]['primary_image'])) {
    $url = $data['data'][0]['primary_image'];
    echo "API URL: $url\n";
    
    // Test fetch
    $imgCurl = curl_init($url);
    curl_setopt_array($imgCurl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_BINARYTRANSFER => true,
    ]);
    $imgResponse = curl_exec($imgCurl);
    $info = curl_getinfo($imgCurl);
    curl_close($imgCurl);
    
    $status = $info['http_code'] === 200 ? "✓ PASS" : "✗ FAIL";
    $tests[] = ['Product List Image', $status];
    echo "Status: " . $info['http_code'] . " | Size: " . strlen($imgResponse) . " bytes | $status\n";
} else {
    $tests[] = ['Product List Image', '✗ FAIL'];
    echo "✗ No image in response\n";
}

echo "\n";

// Test 2: Product detail images
echo "Test 2: Product Detail Images\n";
echo "───────────────────────────────\n";
$curl = curl_init('http://localhost:8000/api/v1/products/kalimat');
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]);
$response = curl_exec($curl);
$data = json_decode($response, true);
curl_close($curl);

if (isset($data['data']['primary_image'])) {
    $url = $data['data']['primary_image'];
    echo "API URL: $url\n";
    
    // Test fetch
    $imgCurl = curl_init($url);
    curl_setopt_array($imgCurl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_BINARYTRANSFER => true,
    ]);
    $imgResponse = curl_exec($imgCurl);
    $info = curl_getinfo($imgCurl);
    curl_close($imgCurl);
    
    $status = $info['http_code'] === 200 ? "✓ PASS" : "✗ FAIL";
    $tests[] = ['Product Detail Image', $status];
    echo "Status: " . $info['http_code'] . " | Size: " . strlen($imgResponse) . " bytes | $status\n";
} else {
    $tests[] = ['Product Detail Image', '✗ FAIL'];
    echo "✗ No image in response\n";
}

echo "\n";

// Test 3: Ingredient images
echo "Test 3: Ingredient Images\n";
echo "──────────────────────────\n";
$curl = curl_init('http://localhost:8000/api/v1/ingredients?limit=1');
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]);
$response = curl_exec($curl);
$data = json_decode($response, true);
curl_close($curl);

if (isset($data['data'][0]['image_url'])) {
    $url = $data['data'][0]['image_url'];
    echo "Ingredient: " . $data['data'][0]['name'] . "\n";
    echo "API URL: $url\n";
    
    // Test fetch
    $imgCurl = curl_init($url);
    curl_setopt_array($imgCurl, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 5,
        CURLOPT_BINARYTRANSFER => true,
    ]);
    $imgResponse = curl_exec($imgCurl);
    $info = curl_getinfo($imgCurl);
    curl_close($imgCurl);
    
    $status = $info['http_code'] === 200 ? "✓ PASS" : "✗ FAIL";
    $tests[] = ['Ingredient Image', $status];
    echo "Status: " . $info['http_code'] . " | Size: " . strlen($imgResponse) . " bytes | $status\n";
} else {
    $tests[] = ['Ingredient Image', '✗ FAIL'];
    echo "✗ No image in response\n";
}

echo "\n";

// Summary
echo "╔════════════════════════════════════════════════════════════╗\n";
echo "║  TEST SUMMARY                                              ║\n";
echo "╚════════════════════════════════════════════════════════════╝\n";
foreach ($tests as [$name, $result]) {
    $padding = str_repeat(" ", 40 - strlen($name));
    echo "$name$padding $result\n";
}

$allPassed = array_every($tests, fn($t) => strpos($t[1], 'PASS') !== false);
echo "\n" . ($allPassed ? "✓ ALL TESTS PASSED!" : "✗ SOME TESTS FAILED") . "\n";
?>
