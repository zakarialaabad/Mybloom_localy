<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    */

    'whatsapp' => [
        // Meta WhatsApp Business Cloud API credentials
        // Docs: https://developers.facebook.com/docs/whatsapp/cloud-api/get-started
        'api_token'       => env('WHATSAPP_API_TOKEN', ''),
        'phone_number_id' => env('WHATSAPP_PHONE_NUMBER_ID', ''),
    ],

    'google' => [
        // OAuth2 credentials from Google Cloud Console
        // Scope required: https://www.googleapis.com/auth/gmail.send
        'client_id'     => env('GOOGLE_CLIENT_ID', ''),
        'client_secret' => env('GOOGLE_CLIENT_SECRET', ''),
        'refresh_token' => env('GOOGLE_REFRESH_TOKEN', ''),

        // The Gmail address that sends the email (must match authorized account)
        'gmail_from'    => env('GMAIL_FROM', ''),

        // Where admin order notifications are sent
        'admin_email'   => env('ADMIN_EMAIL', ''),
    ],

];
