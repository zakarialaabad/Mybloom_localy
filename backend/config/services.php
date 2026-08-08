<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'google' => [
        // OAuth2 credentials from Google Cloud Console
        // Scope required: https://www.googleapis.com/auth/gmail.send
        'client_id' => env('GOOGLE_CLIENT_ID', ''),
        'client_secret' => env('GOOGLE_CLIENT_SECRET', ''),
        'refresh_token' => env('GOOGLE_REFRESH_TOKEN', ''),

        // The Gmail address that sends the email (must match authorized account)
        'gmail_from' => env('GMAIL_FROM', ''),

        // Where admin order notifications are sent
        'admin_email' => env('ADMIN_EMAIL', ''),
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'client_secret' => env('GOOGLE_CLIENT_SECRET'),
        'refresh_token' => env('GOOGLE_REFRESH_TOKEN'),
    ],

    'openwa' => [
        'enabled' => (bool) env('OPENWA_ENABLED', false),
        'base_url' => env('OPENWA_BASE_URL', 'http://127.0.0.1:2785/api'),
        // Local OpenWA can keep its generated key in a protected file outside
        // the web root. Production continues to use OPENWA_API_KEY directly.
        // The file option is server-side only and never reaches Next.js.
        'api_key' => (static function (): ?string {
            $keyFile = env('OPENWA_API_KEY_FILE');
            if (is_string($keyFile) && $keyFile !== '' && is_readable($keyFile)) {
                return trim((string) file_get_contents($keyFile));
            }

            return env('OPENWA_API_KEY');
        })(),
        'session_id' => env('OPENWA_SESSION_ID', 'mybloom-owner'),
        'owner_e164' => env('OPENWA_OWNER_E164', '212639760141'),
        'admin_recipient_e164' => env('OPENWA_ADMIN_RECIPIENT_E164', '212611955060'),
        'webhook_secret' => env('OPENWA_WEBHOOK_SECRET'),
        'webhook_url' => env('OPENWA_WEBHOOK_URL'),
        'connect_timeout' => (int) env('OPENWA_CONNECT_TIMEOUT', 3),
        'request_timeout' => (int) env('OPENWA_REQUEST_TIMEOUT', 15),
        'admin_request_timeout' => max(15, (int) env('OPENWA_ADMIN_REQUEST_TIMEOUT', 45)),
        'auto_ack_timeout_seconds' => max(30, (int) env('OPENWA_AUTO_ACK_TIMEOUT_SECONDS', 120)),
        'fallback_token_ttl_hours' => max(1, (int) env('OPENWA_FALLBACK_TOKEN_TTL_HOURS', 168)),
        'invoice_link_expiry_days' => max(1, (int) env('OPENWA_INVOICE_LINK_EXPIRY_DAYS', 7)),
        'invoice_public_url' => env('OPENWA_INVOICE_PUBLIC_URL', env('APP_URL')),
    ],
];
