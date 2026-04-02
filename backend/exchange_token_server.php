<?php
/**
 * exchange_token_server.php — Auto-capture OAuth2 redirect handler
 *
 * Role: This file acts as a mini web server page.
 *       It is served by PHP's built-in server (started by the artisan gmail:get-token command)
 *       on http://localhost:9090. When Google redirects the user after login,
 *       this script automatically receives the authorization code, exchanges it
 *       for a refresh token, and writes it to .env — no manual copy/paste needed.
 *
 * How it is invoked:
 *   php -S localhost:9090 exchange_token_server.php
 *   (started automatically by: php artisan gmail:get-token)
 *
 * Flow:
 *   1. User opens OAuth URL in browser with redirect_uri=http://localhost:9090
 *   2. User signs in and clicks Allow
 *   3. Google redirects browser to: http://localhost:9090/?code=4/0Abc...
 *   4. This script receives the request, reads $_GET['code']
 *   5. Sends POST to Google token endpoint to exchange code for refresh_token
 *   6. Writes GOOGLE_REFRESH_TOKEN to .env
 *   7. Returns success HTML page to browser
 */

// ── Guard: abort if no authorization code was received in the query string ───
// Google always sends ?code=... on successful authorization.
// If it's missing, the user probably visited the page directly without going through OAuth.
if (!isset($_GET['code'])) {
    http_response_code(400); // Return HTTP 400 Bad Request
    echo "<h2>❌ No code received. Try again.</h2>";
    exit; // Stop execution — nothing to do without the code
}

// ── Extract the authorization code from the query parameter ──────────────────
// This is the one-time code Google returns after the user grants access.
// It is valid for ~60 seconds and can only be used ONCE.
$code = $_GET['code'];

// ── Exchange the authorization code for tokens via curl POST ─────────────────
// We send the code to Google's token endpoint along with our app credentials.
// Google returns: access_token (1h), refresh_token (permanent), token_type, expires_in
$ch = curl_init('https://oauth2.googleapis.com/token'); // Open a curl handle to Google's token API
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);         // Return response as string instead of printing it
curl_setopt($ch, CURLOPT_POST, true);                   // This is a POST request (required by OAuth2 spec)
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'code'          => $code,           // The one-time auth code from Google's redirect
    'client_id'     => '379053566763-8ikbpbc0mohpls89fddv859n992l9ghq.apps.googleusercontent.com', // From google-credentials.json
    'client_secret' => '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', // From google-credentials.json
    'redirect_uri'  => 'http://localhost:9090', // Must exactly match what was used in the auth URL
    'grant_type'    => 'authorization_code',    // OAuth2 grant type for one-time code exchange
]));

$response = curl_exec($ch); // Execute the request and capture the raw JSON response
curl_close($ch);            // Always close curl handles to free memory
$data = json_decode($response, true); // Decode JSON into PHP associative array

// ── Handle successful token response ─────────────────────────────────────────
if (isset($data['refresh_token'])) {
    $refreshToken = $data['refresh_token']; // This is the permanent token — never expires unless revoked

    // ── Write the refresh token into the .env file ───────────────────────────
    // We update GOOGLE_REFRESH_TOKEN= in place if it already exists,
    // or append it to the end of .env if it doesn't exist yet.
    $envPath = __DIR__ . '/.env';          // Absolute path to the Laravel .env file
    $env = file_get_contents($envPath);    // Read the entire .env file content as a string

    if (strpos($env, 'GOOGLE_REFRESH_TOKEN=') !== false) {
        // ── Replace existing line using regex ────────────────────────────────
        // preg_replace matches the full line GOOGLE_REFRESH_TOKEN=whatever
        // and replaces it with the new token value
        $env = preg_replace('/GOOGLE_REFRESH_TOKEN=.*/', 'GOOGLE_REFRESH_TOKEN=' . $refreshToken, $env);
    } else {
        // ── Append new line if the key doesn't exist yet ─────────────────────
        $env .= "\nGOOGLE_REFRESH_TOKEN=" . $refreshToken . "\n";
    }

    file_put_contents($envPath, $env); // Write the updated content back to .env

    // ── Clear Laravel's config cache so the new token is loaded immediately ──
    // Without this, Laravel might keep using the old cached value from config:cache
    shell_exec('php ' . __DIR__ . '/artisan config:clear 2>&1');

    // ── Return a green success HTML page to the browser ──────────────────────
    echo "<!DOCTYPE html><html><body style='font-family:sans-serif;text-align:center;padding:60px;background:#f0fdf4'>
        <h1 style='color:#16a34a'>✅ Success!</h1>
        <p style='font-size:18px'>Refresh token saved to <code>.env</code></p>
        <p style='color:#555'>You can now close this tab and run <code>php artisan queue:work</code></p>
        <hr>
        <p style='font-size:12px;color:#aaa'>Token: <code>" . substr($refreshToken, 0, 20) . "...</code></p>
    </body></html>";
} else {
    // ── Token exchange failed — show the raw Google error response ───────────
    // Common reasons: code expired (>60s), code already used, wrong redirect_uri
    echo "<!DOCTYPE html><html><body style='font-family:sans-serif;text-align:center;padding:60px;background:#fef2f2'>
        <h1 style='color:#dc2626'>❌ Failed</h1>
        <pre>" . htmlspecialchars($response) . "</pre>
    </body></html>";
}
