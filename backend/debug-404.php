<?php
$response = @file_get_contents('http://localhost:8000/api/test-route');
echo "Response: " . $response . "\n";
?>
