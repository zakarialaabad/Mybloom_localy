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

];
