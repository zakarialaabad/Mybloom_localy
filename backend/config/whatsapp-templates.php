<?php

/**
 * WhatsApp Template Configuration
 * 
 * Define message templates to use for different events.
 * Templates must be pre-approved in your Meta WhatsApp Business Account.
 * 
 * IMPORTANT:
 * 1. Create templates in Meta's Template Manager
 * 2. Add template name here
 * 3. Specify parameters (number of variables) and language
 * 4. Use in your jobs by calling: WhatsAppService->sendTemplate(...)
 * 
 * Example template in Meta:
 * ─────────────────────────────────────────────────────────────
 * Name: order_confirmation
 * Language: English (US)
 * Body:
 * "Hi {{1}}, thanks for your order!
 *  Order ID: {{2}}
 *  Total: {{3}} DH
 *  
 *  Track your order: https://mybloom.com/track?order={{2}}"
 * ─────────────────────────────────────────────────────────────
 */

return [
    /*
    |--------------------------------------------------------------------------
    | Default Language Code
    |--------------------------------------------------------------------------
    | Used when sending templates. Format: xx_YY (e.g., en_US, fr_FR)
    */
    'default_language' => env('WHATSAPP_TEMPLATE_LANGUAGE', 'en_US'),

    /*
    |--------------------------------------------------------------------------
    | Template Definitions
    |--------------------------------------------------------------------------
    | Define templates with their parameters and default language
    */
    'templates' => [
        'order_confirmation' => [
            'description'       => 'Send order confirmation to customer',
            'language'          => env('WHATSAPP_TEMPLATE_LANGUAGE_ORDER', 'en_US'),
            'param_count'       => 3,
            'params'            => ['customer_name', 'order_number', 'total'],
            'template_meta_name' => env('WHATSAPP_TEMPLATE_ORDER_CONFIRMATION', 'order_confirmation'),
        ],

        'order_shipped' => [
            'description'       => 'Notify customer when order is shipped',
            'language'          => env('WHATSAPP_TEMPLATE_LANGUAGE_SHIPPED', 'en_US'),
            'param_count'       => 2,
            'params'            => ['customer_name', 'order_number'],
            'template_meta_name' => env('WHATSAPP_TEMPLATE_ORDER_SHIPPED', 'order_shipped'),
        ],

        'new_order_admin' => [
            'description'       => 'Notify admin about new order',
            'language'          => env('WHATSAPP_TEMPLATE_LANGUAGE_ADMIN', 'en_US'),
            'param_count'       => 4,
            'params'            => ['order_number', 'customer_name', 'total', 'item_count'],
            'template_meta_name' => env('WHATSAPP_TEMPLATE_NEW_ORDER_ADMIN', 'new_order_admin'),
        ],

        'order_cancelled' => [
            'description'       => 'Notify customer about order cancellation',
            'language'          => env('WHATSAPP_TEMPLATE_LANGUAGE_CANCELLED', 'en_US'),
            'param_count'       => 2,
            'params'            => ['customer_name', 'order_number'],
            'template_meta_name' => env('WHATSAPP_TEMPLATE_ORDER_CANCELLED', 'order_cancelled'),
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Opt-in Settings
    |--------------------------------------------------------------------------
    | Control whether opt-in consent is required
    */
    'require_opt_in' => env('WHATSAPP_REQUIRE_OPT_IN', true),

    /*
    |--------------------------------------------------------------------------
    | Retry Settings
    |--------------------------------------------------------------------------
    | Control retry behavior for failed messages
    */
    'retry' => [
        'max_attempts' => env('WHATSAPP_MAX_RETRIES', 2),
        'timeout_seconds' => env('WHATSAPP_JOB_TIMEOUT', 120),
    ],

    /*
    |--------------------------------------------------------------------------
    | Phone Number Formatting
    |--------------------------------------------------------------------------
    | Default country code for phone formatting when not provided
    */
    'phone' => [
        'country_code' => env('WHATSAPP_COUNTRY_CODE', '212'), // Morocco
        'min_length' => 9,
        'max_length' => 15,
    ],

    /*
    |--------------------------------------------------------------------------
    | Logging & Monitoring
    |--------------------------------------------------------------------------
    | Enable detailed logging for debugging
    */
    'logging' => [
        'enabled' => env('WHATSAPP_LOGGING_ENABLED', true),
        'log_api_responses' => env('WHATSAPP_LOG_API_RESPONSES', false),
        'log_sensitive_data' => env('WHATSAPP_LOG_SENSITIVE_DATA', false),
    ],
];
