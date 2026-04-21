<?php
$curl = curl_init('http://localhost:8000/api/v1/products/kalimat');
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]);
$response = curl_exec($curl);
$info = curl_getinfo($curl);
curl_close($curl);

echo "Status: " . $info['http_code'] . "\n";
if ($info['http_code'] === 200) {
    $data = json_decode($response, true);
    echo "primary_image: " . ($data['primary_image'] ?? 'NULL') . "\n";
    echo "Has images array: " . (isset($data['images']) ? 'YES' : 'NO') . "\n";
    if (isset($data['images'][0])) {
        echo "First image URL: " . $data['images'][0]['image_url'] . "\n";
    }
} else {
    echo "Error: " . substr($response, 0, 200) . "\n";
}
?>
