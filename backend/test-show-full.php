<?php
$curl = curl_init('http://localhost:8000/api/v1/products/kalimat');
curl_setopt_array($curl, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5]);
$response = curl_exec($curl);
$data = json_decode($response, true);

echo "Response keys: " . implode(", ", array_keys($data)) . "\n\n";
echo json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
?>
