<?php

$ch = curl_init('https://oauth2.googleapis.com/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'code'          => '4/0Aci98E9dfxvwJNiDvx4dCVKkWB17YRuobpahMOnh_Fuh22v6pPjoo3kKdg3gEgmMOO8fWQ',
    'client_id'     => '379053566763-8ikbpbc0mohpls89fddv859n992l9ghq.apps.googleusercontent.com',
    'client_secret' => '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',
    'redirect_uri'  => 'http://localhost:9090',
    'grant_type'    => 'authorization_code',
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

$data = json_decode($response, true);

if (isset($data['refresh_token'])) {
    $refreshToken = $data['refresh_token'];
    echo "✅ Refresh token obtained!\n";
    echo "Refresh Token: " . $refreshToken . "\n\n";

    // Auto-write to .env
    $envPath = __DIR__ . '/.env';
    $env = file_get_contents($envPath);

    if (strpos($env, 'GOOGLE_REFRESH_TOKEN=') !== false) {
        $env = preg_replace('/GOOGLE_REFRESH_TOKEN=.*/', 'GOOGLE_REFRESH_TOKEN=' . $refreshToken, $env);
    } else {
        $env .= "\nGOOGLE_REFRESH_TOKEN=" . $refreshToken . "\n";
    }

    file_put_contents($envPath, $env);
    echo "✅ .env updated successfully!\n";
    echo "You can now run: php artisan queue:work\n";
} else {
    echo "❌ Failed to get refresh token.\n";
    echo "HTTP Code: " . $httpCode . "\n";
    echo "Response: " . $response . "\n";
}
