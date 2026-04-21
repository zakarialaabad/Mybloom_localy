<?php
$curl = curl_init('http://localhost:8000/api/v1/products?limit=1');
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 5,
]);

$response = curl_exec($curl);
$data = json_decode($response, true);

if (isset($data['data'][0])) {
    $product = $data['data'][0];
    echo "Product keys: " . implode(", ", array_keys($product)) . "\n\n";
    
    echo json_encode($product, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
}
?>
