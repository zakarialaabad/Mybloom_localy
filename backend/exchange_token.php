<?php
/**
 * exchange_token.php — Emergency one-shot token exchange script
 *
 * Role: A debug/emergency CLI script that directly exchanges a hardcoded
 *       authorization code for a refresh token using PHP's native curl.
 *       Used when the server-based approach (exchange_token_server.php) was
 *       not yet available and the code needed to be exchanged immediately.
 *
 * WARNING: Authorization codes expire in ~60 seconds after being issued by Google.
 *          This script must be run IMMEDIATELY after copying the code from the
 *          browser URL bar. If more than ~60s pass, Google returns: "invalid_grant".
 *
 * When to use:
 *   - Emergency: exchange_token_server.php is not working
 *   - Debugging: you already have a fresh code and want to exchange it directly
 *   - One-time manual recovery
 *
 * How to use:
 *   1. Get a fresh code from the OAuth URL (redirect to localhost:9090)
 *   2. Replace the 'code' value below with the new code
 *   3. Run immediately: php exchange_token.php
 */

// ── Send POST request to Google's token endpoint via curl ────────────────────
// curl is PHP's native HTTP client — no Guzzle or composer dependency needed here
$ch = curl_init('https://oauth2.googleapis.com/token'); // Open curl handle to Google OAuth token API
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);         // Capture response as string (don't print it)
curl_setopt($ch, CURLOPT_POST, true);                   // Use POST method (required by OAuth2)
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    // ⚠️  The hardcoded auth code — replace this with a fresh one each time you use this script
    // Auth codes are one-use only and expire in ~60 seconds
    'code'          => '4/0Aci98E9dfxvwJNiDvx4dCVKkWB17YRuobpahMOnh_Fuh22v6pPjoo3kKdg3gEgmMOO8fWQ',

    'client_id'     => '379053566763-8ikbpbc0mohpls89fddv859n992l9ghq.apps.googleusercontent.com', // From google-credentials.json → installed.client_id
    'client_secret' => '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', // From google-credentials.json → installed.client_secret
    'redirect_uri'  => 'http://localhost:9090', // Must match the redirect_uri used when the code was generated
    'grant_type'    => 'authorization_code',    // Tells Google we are exchanging an auth code (not refreshing)
]));

$response = curl_exec($ch);                              // Execute the request — returns raw JSON string
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);       // Get the HTTP status code (200 = success, 400 = error)
curl_close($ch);                                         // Close the curl handle and free memory

$data = json_decode($response, true); // Decode JSON response into PHP array

// ── Handle successful response ───────────────────────────────────────────────
if (isset($data['refresh_token'])) {
    $refreshToken = $data['refresh_token']; // Permanent token — store this in .env, never expires unless revoked
    echo "✅ Refresh token obtained!\n";
    echo "Refresh Token: " . $refreshToken . "\n\n";

    // ── Auto-write the refresh token into .env ───────────────────────────────
    // Reads the entire .env file, replaces or appends GOOGLE_REFRESH_TOKEN
    $envPath = __DIR__ . '/.env';       // Absolute path to Laravel's .env file
    $env = file_get_contents($envPath); // Load entire .env as a string

    if (strpos($env, 'GOOGLE_REFRESH_TOKEN=') !== false) {
        // ── Key exists → replace its value in place ──────────────────────────
        $env = preg_replace('/GOOGLE_REFRESH_TOKEN=.*/', 'GOOGLE_REFRESH_TOKEN=' . $refreshToken, $env);
    } else {
        // ── Key missing → append it at the end of .env ───────────────────────
        $env .= "\nGOOGLE_REFRESH_TOKEN=" . $refreshToken . "\n";
    }

    file_put_contents($envPath, $env); // Save updated content back to .env
    echo "✅ .env updated successfully!\n";
    echo "You can now run: php artisan queue:work\n";
} else {
    // ── Exchange failed — print debug info ───────────────────────────────────
    // Common errors:
    //   invalid_grant  → code already used or expired (>60s)
    //   redirect_uri_mismatch → redirect_uri here doesn't match what was used for the code
    //   invalid_client → wrong client_id or client_secret
    echo "❌ Failed to get refresh token.\n";
    echo "HTTP Code: " . $httpCode . "\n";  // HTTP status code from Google
    echo "Response: "  . $response . "\n"; // Raw JSON error from Google
}
