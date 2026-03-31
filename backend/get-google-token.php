<?php
/**
 * ONE-TIME script to generate a Google OAuth2 refresh token.
 * Uses Guzzle HTTP (already installed) — no google/apiclient needed.
 *
 * Run:  php get-google-token.php
 *
 * Steps:
 *  1. Script prints an authorization URL — open it in your browser
 *  2. Sign in with zakarialaalbad200@gmail.com and allow access
 *  3. Google redirects to http://localhost/?code=XXXXX  (page won't load — that's OK)
 *  4. Copy the FULL URL from the browser address bar and paste it here
 *  5. Script prints your REFRESH_TOKEN and auto-updates .env
 */

require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\Client;

$clientId     = '379053566763-8ikbpbc0mohpls89fddv859n992l9ghq.apps.googleusercontent.com';
$clientSecret = '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';
$redirectUri  = 'http://localhost';
$scope        = 'https://www.googleapis.com/auth/gmail.send';

// ── STEP 1: Build and print auth URL ─────────────────────────────────────────
$authUrl = 'https://accounts.google.com/o/oauth2/auth?' . http_build_query([
    'client_id'     => $clientId,
    'redirect_uri'  => $redirectUri,
    'response_type' => 'code',
    'scope'         => $scope,
    'access_type'   => 'offline',
    'prompt'        => 'consent',  // Forces refresh_token to always be returned
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

echo "Paste the full redirect URL here and press Enter:\n> ";
$redirectUrl = trim(fgets(STDIN));

// ── STEP 2: Extract code from URL ─────────────────────────────────────────────
$parsedQuery = [];
parse_str(parse_url($redirectUrl, PHP_URL_QUERY), $parsedQuery);

if (empty($parsedQuery['code'])) {
    die("❌ Could not extract authorization code. Make sure you pasted the full redirect URL.\n");
}

$code = $parsedQuery['code'];
echo "\n✅ Authorization code extracted.\n";
echo "Exchanging for tokens...\n\n";

// ── STEP 3: Exchange code for tokens via Guzzle ────────────────────────────────
$http = new Client(['timeout' => 15]);

try {
    $response = $http->post('https://oauth2.googleapis.com/token', [
        'form_params' => [
            'code'          => $code,
            'client_id'     => $clientId,
            'client_secret' => $clientSecret,
            'redirect_uri'  => $redirectUri,
            'grant_type'    => 'authorization_code',
        ],
    ]);

    $token = json_decode((string) $response->getBody(), true);
} catch (\Exception $e) {
    die("❌ Failed to exchange code: " . $e->getMessage() . "\n");
}

if (isset($token['error'])) {
    die("❌ Google error: " . $token['error'] . ' — ' . ($token['error_description'] ?? '') . "\n");
}

if (empty($token['refresh_token'])) {
    echo "⚠️  No refresh_token returned.\n";
    echo "   This means the account already authorized this app.\n";
    echo "   Revoke access at https://myaccount.google.com/permissions then re-run.\n\n";
} else {
    $refreshToken = $token['refresh_token'];

    echo "==============================================================\n";
    echo " ✅ SUCCESS! Your refresh token:\n";
    echo "==============================================================\n";
    echo "GOOGLE_REFRESH_TOKEN={$refreshToken}\n";
    echo "==============================================================\n\n";

    // Auto-update .env
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        $content = file_get_contents($envFile);
        $updated = preg_replace(
            '/^GOOGLE_REFRESH_TOKEN=.*$/m',
            "GOOGLE_REFRESH_TOKEN={$refreshToken}",
            $content
        );
        if ($updated !== $content) {
            file_put_contents($envFile, $updated);
            echo "✅ .env updated automatically with GOOGLE_REFRESH_TOKEN!\n\n";
        }
    }
}

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
