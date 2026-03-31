<?php

if (!isset($_GET['code'])) {
    http_response_code(400);
    echo "<h2>❌ No code received. Try again.</h2>";
    exit;
}

$code = $_GET['code'];

// Exchange code for tokens
$ch = curl_init('https://oauth2.googleapis.com/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'code'          => $code,
    'client_id'     => '379053566763-8ikbpbc0mohpls89fddv859n992l9ghq.apps.googleusercontent.com',
    'client_secret' => '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',
    'redirect_uri'  => 'http://localhost:9090',
    'grant_type'    => 'authorization_code',
]));

$response = curl_exec($ch);
curl_close($ch);
$data = json_decode($response, true);

if (isset($data['refresh_token'])) {
    $refreshToken = $data['refresh_token'];

    // Write to .env
    $envPath = __DIR__ . '/.env';
    $env = file_get_contents($envPath);

    if (strpos($env, 'GOOGLE_REFRESH_TOKEN=') !== false) {
        $env = preg_replace('/GOOGLE_REFRESH_TOKEN=.*/', 'GOOGLE_REFRESH_TOKEN=' . $refreshToken, $env);
    } else {
        $env .= "\nGOOGLE_REFRESH_TOKEN=" . $refreshToken . "\n";
    }

    file_put_contents($envPath, $env);

    // Clear config cache
    shell_exec('php ' . __DIR__ . '/artisan config:clear 2>&1');

    echo "<!DOCTYPE html><html><body style='font-family:sans-serif;text-align:center;padding:60px;background:#f0fdf4'>
        <h1 style='color:#16a34a'>✅ Success!</h1>
        <p style='font-size:18px'>Refresh token saved to <code>.env</code></p>
        <p style='color:#555'>You can now close this tab and run <code>php artisan queue:work</code></p>
        <hr>
        <p style='font-size:12px;color:#aaa'>Token: <code>" . substr($refreshToken, 0, 20) . "...</code></p>
    </body></html>";
} else {
    echo "<!DOCTYPE html><html><body style='font-family:sans-serif;text-align:center;padding:60px;background:#fef2f2'>
        <h1 style='color:#dc2626'>❌ Failed</h1>
        <pre>" . htmlspecialchars($response) . "</pre>
    </body></html>";
}
