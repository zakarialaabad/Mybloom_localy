<?php
/**
 * get-google-token.php — Interactive CLI OAuth2 refresh token generator
 *
 * Role: A one-time command-line script that guides the developer through
 *       the Google OAuth2 authorization flow to obtain a permanent refresh token.
 *       Unlike exchange_token_server.php, this script requires the user to
 *       manually copy the redirect URL from the browser and paste it into the terminal.
 *
 * Dependency: Uses Guzzle HTTP (already in composer.json) — no google/apiclient needed.
 *
 * Run:  php get-google-token.php
 *
 * Steps:
 *  1. Script builds and prints an authorization URL
 *  2. Developer opens URL in browser and signs in with zakarialaalbad200@gmail.com
 *  3. Google redirects to http://localhost/?code=XXXXX  (page won't load — that's OK)
 *  4. Developer copies the FULL URL from the browser address bar and pastes it into terminal
 *  5. Script extracts the code, exchanges it for tokens, and auto-updates .env
 *
 * Limitation: Fails if http://localhost:3000 (or any app) intercepts the redirect.
 *             In that case use exchange_token_server.php on port 9090 instead.
 */

require __DIR__ . '/vendor/autoload.php'; // Load Guzzle and all Composer packages

use GuzzleHttp\Client; // Guzzle HTTP client — used for the token exchange POST request

// ── OAuth2 Application Credentials ──────────────────────────────────────────
// These values come from google-credentials.json (downloaded from Google Cloud Console)
// and are also stored in .env as GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
$clientId     = '379053566763-8ikbpbc0mohpls89fddv859n992l9ghq.apps.googleusercontent.com'; // Identifies your app to Google
$clientSecret = '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'; // Proves your app's identity (keep secret)
$redirectUri  = 'http://localhost';                      // Where Google sends the user after login (must be registered in Cloud Console)
$scope        = 'https://www.googleapis.com/auth/gmail.send'; // Only requests permission to send emails — nothing else

// ── STEP 1: Build and print auth URL ─────────────────────────────────────────
// Construct the full Google authorization URL with all required OAuth2 parameters
$authUrl = 'https://accounts.google.com/o/oauth2/auth?' . http_build_query([
    'client_id'     => $clientId,      // Identifies which app is requesting access
    'redirect_uri'  => $redirectUri,   // Where Google redirects after user approves
    'response_type' => 'code',         // OAuth2 flow: we want an authorization code (not a token directly)
    'scope'         => $scope,         // What permissions we need (gmail.send only)
    'access_type'   => 'offline',      // REQUIRED: tells Google to return a refresh_token (for server use)
    'prompt'        => 'consent',      // Forces the consent screen every time — ensures refresh_token is always returned
                                       // Without 'consent', Google only returns refresh_token on first authorization
]);

echo "\n";
echo "==============================================================\n";
echo " STEP 1: Open this URL in your browser:\n";
echo "==============================================================\n\n";
echo $authUrl . "\n\n";
echo "==============================================================\n";
echo " Sign in with: zakarialaalbad200@gmail.com\n";
echo " After redirect, the browser shows a 'page not found' — that's OK.\n";
echo " Copy the FULL URL from the browser address bar.\n";
echo "==============================================================\n\n";

// ── STEP 2: Wait for the user to paste the full redirect URL ─────────────────
// fgets(STDIN) blocks execution and waits for user to type input and press Enter
echo "Paste the full redirect URL here and press Enter:\n> ";
$redirectUrl = trim(fgets(STDIN)); // Read one line from terminal, trim whitespace

// ── STEP 3: Extract the authorization code from the pasted URL ───────────────
// parse_url() extracts just the query string (e.g. "code=4/0Abc...&scope=...")
// parse_str() converts the query string into an associative array
$parsedQuery = [];
parse_str(parse_url($redirectUrl, PHP_URL_QUERY), $parsedQuery);

// Abort if the code param is missing (user pasted wrong URL or authorization failed)
if (empty($parsedQuery['code'])) {
    die("❌ Could not extract authorization code. Make sure you pasted the full redirect URL.\n");
}

$code = $parsedQuery['code']; // The one-time authorization code from Google
echo "\n✅ Authorization code extracted.\n";
echo "Exchanging for tokens...\n\n";

// ── STEP 4: Exchange the authorization code for tokens via Guzzle POST ───────
// Send the code to Google's token endpoint to get access_token + refresh_token
// timeout=15 means Guzzle will give up if Google doesn't respond within 15 seconds
$http = new Client(['timeout' => 15]);

try {
    $response = $http->post('https://oauth2.googleapis.com/token', [
        'form_params' => [
            'code'          => $code,          // The one-time code just extracted
            'client_id'     => $clientId,      // App identifier
            'client_secret' => $clientSecret,  // App secret
            'redirect_uri'  => $redirectUri,   // Must match exactly what was used to get the code
            'grant_type'    => 'authorization_code', // OAuth2: exchanging a code for tokens
        ],
    ]);

    // Decode the JSON response body into a PHP array
    $token = json_decode((string) $response->getBody(), true);
} catch (\Exception $e) {
    // Guzzle throws exceptions for network errors or non-2xx responses
    die("❌ Failed to exchange code: " . $e->getMessage() . "\n");
}

// ── STEP 5: Handle the Google token response ──────────────────────────────────
if (isset($token['error'])) {
    // Google returned an error in the JSON body (e.g. invalid_grant, expired code)
    die("❌ Google error: " . $token['error'] . ' — ' . ($token['error_description'] ?? '') . "\n");
}

if (empty($token['refresh_token'])) {
    // refresh_token is only returned when access_type=offline AND it's the first authorization
    // or when prompt=consent is set. If missing, the app was already authorized before.
    echo "⚠️  No refresh_token returned.\n";
    echo "   This means the account already authorized this app.\n";
    echo "   Revoke access at https://myaccount.google.com/permissions then re-run.\n\n";
} else {
    $refreshToken = $token['refresh_token']; // The permanent token — never expires unless manually revoked

    echo "==============================================================\n";
    echo " ✅ SUCCESS! Your refresh token:\n";
    echo "==============================================================\n";
    echo "GOOGLE_REFRESH_TOKEN={$refreshToken}\n";
    echo "==============================================================\n\n";

    // ── STEP 6: Auto-update the .env file ────────────────────────────────────
    // Reads .env, replaces GOOGLE_REFRESH_TOKEN= line if exists, otherwise appends
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        $content = file_get_contents($envFile); // Read entire .env as string
        $updated = preg_replace(
            '/^GOOGLE_REFRESH_TOKEN=.*$/m',          // Match the existing line (multiline mode)
            "GOOGLE_REFRESH_TOKEN={$refreshToken}",  // Replace with new token
            $content
        );
        if ($updated !== $content) {
            file_put_contents($envFile, $updated); // Write updated content back to .env
            echo "✅ .env updated automatically with GOOGLE_REFRESH_TOKEN!\n\n";
        }
    }
}

// Print the short-lived access token for reference (valid ~1 hour, not stored)
echo "Access token (valid ~1h): " . ($token['access_token'] ?? 'N/A') . "\n\n";
echo "Done! You can now run: php artisan queue:work\n";


$credentialsFile = __DIR__ . '/storage/app/google-credentials.json';

if (!file_exists($credentialsFile)) {
    die("❌ Credentials file not found: {$credentialsFile}\n");
}

$client = new Google\Client();
$client->setAuthConfig($credentialsFile);
$client->setScopes(['https://www.googleapis.com/auth/gmail.send']);
$client->setAccessType('offline');
$client->setPrompt('consent'); // forces refresh_token to always be returned

// ── STEP 1: Print the auth URL ─────────────────────────────────────────────
$authUrl = $client->createAuthUrl();

echo "\n";
echo "==============================================================\n";
echo " STEP 1: Open this URL in your browser:\n";
echo "==============================================================\n";
echo $authUrl . "\n";
echo "==============================================================\n";
echo "\n";
echo "Sign in with:  zakarialaalbad200@gmail.com\n";
echo "After Google redirects to localhost (page won't load — that's OK),\n";
echo "copy the FULL URL from the browser address bar.\n\n";

// ── STEP 2: Accept the redirect URL from user ─────────────────────────────
echo "Paste the full redirect URL here and press Enter:\n> ";
$redirectUrl = trim(fgets(STDIN));

// Extract the code from the URL
$parsedQuery = [];
parse_str(parse_url($redirectUrl, PHP_URL_QUERY), $parsedQuery);

if (empty($parsedQuery['code'])) {
    die("❌ Could not extract authorization code from the URL. Make sure you pasted the full URL.\n");
}

$code = $parsedQuery['code'];

// ── STEP 3: Exchange code for tokens ──────────────────────────────────────
try {
    $token = $client->fetchAccessTokenWithAuthCode($code);
} catch (\Exception $e) {
    die("❌ Failed to exchange code: " . $e->getMessage() . "\n");
}

if (isset($token['error'])) {
    die("❌ Google returned error: " . $token['error'] . ' — ' . ($token['error_description'] ?? '') . "\n");
}

if (empty($token['refresh_token'])) {
    echo "\n⚠️  No refresh_token returned. This usually means the account already\n";
    echo "   authorized this app. To force a new token:\n";
    echo "   Go to https://myaccount.google.com/permissions and REVOKE access,\n";
    echo "   then run this script again.\n\n";
} else {
    $refreshToken = $token['refresh_token'];

    echo "\n";
    echo "==============================================================\n";
    echo " ✅ SUCCESS! Copy this into your .env file:\n";
    echo "==============================================================\n";
    echo "GOOGLE_REFRESH_TOKEN={$refreshToken}\n";
    echo "==============================================================\n\n";

    // Auto-update .env file
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        $envContent = file_get_contents($envFile);
        $updated = preg_replace(
            '/^GOOGLE_REFRESH_TOKEN=.*$/m',
            "GOOGLE_REFRESH_TOKEN={$refreshToken}",
            $envContent
        );
        if ($updated !== $envContent) {
            file_put_contents($envFile, $updated);
            echo "✅ .env file updated automatically!\n";
            echo "   GOOGLE_REFRESH_TOKEN has been set.\n\n";
        }
    }

    echo "Access token (expires in ~1 hour): " . ($token['access_token'] ?? 'N/A') . "\n\n";
}
