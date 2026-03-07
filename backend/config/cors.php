<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Restrict the API to be consumed only by the trusted Next.js frontend.
    | Update FRONTEND_URL in .env for each environment.
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_filter([
        env('FRONTEND_URL', 'http://localhost:3000'),
        env('FRONTEND_NETWORK_URL'),   // set in .env for LAN/mobile access
    ]),

    // During local development only: uncomment to allow any LAN device
    // 'allowed_origins_patterns' => ['/^http:\/\/192\.168\.\d+\.\d+:\d+$/'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
    ],

    'exposed_headers' => [],

    'max_age' => 86400, // 24 h preflight cache

    'supports_credentials' => true,

];
