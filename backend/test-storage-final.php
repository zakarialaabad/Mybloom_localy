<?php
// Test storage route
$curl = curl_init('http://localhost:8000/api/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp');
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 5,
    CURLOPT_BINARYTRANSFER => true,
]);

$response = curl_exec($curl);
$info = curl_getinfo($curl);
curl_close($curl);

echo "URL: http://localhost:8000/api/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp\n";
echo "HTTP Code: " . $info['http_code'] . "\n";
echo "Content-Type: " . $info['content_type'] . "\n";
echo "Response length: " . strlen($response) . " bytes\n";

if ($info['http_code'] === 200) {
    echo "✓ Success! Image served correctly\n";
} else {
    echo "Response: " . substr($response, 0, 200) . "\n";
}
?>
