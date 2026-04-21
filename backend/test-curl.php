<?php
// Use curl to test
$curl = curl_init('http://localhost:8000/api/test-route');
curl_setopt_array($curl, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 5,
    CURLOPT_VERBOSE => false,
]);

$response = curl_exec($curl);
$info = curl_getinfo($curl);
curl_close($curl);

echo "URL: http://localhost:8000/api/test-route\n";
echo "HTTP Code: " . $info['http_code'] . "\n";
echo "Content-Type: " . $info['content_type'] . "\n";
echo "Response length: " . strlen($response) . "\n";
echo "Response: " . substr($response, 0, 200) . "\n";
?>
