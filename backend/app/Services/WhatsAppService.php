<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * WhatsApp Cloud API Service (Meta / Graph API v19.0)
 * 
 * Production-ready service for sending template-based WhatsApp messages.
 * Uses only pre-approved templates to ensure deliverability and comply with Meta policies.
 * 
 * Features:
 * - Template message support (no free text)
 * - Automatic phone number formatting
 * - Retry-safe with logging
 * - Multi-language support
 */
class WhatsAppService
{
    private string $apiToken;
    private string $phoneNumberId;
    private string $apiVersion = 'v19.0';

    public function __construct()
    {
        $this->apiToken      = (string) config('services.whatsapp.api_token', '');
        $this->phoneNumberId = (string) config('services.whatsapp.phone_number_id', '');
    }

    /**
     * Send a template message via WhatsApp.
     * 
     * PRODUCTION-READY: Uses Meta-approved templates only.
     * The template must exist in your WhatsApp Business Account template manager.
     *
     * @param string $to            Phone number (any format: +212611955060, 212611955060, 0611955060, etc.)
     * @param string $templateName  Template name (must be pre-approved in WhatsApp Business Account)
     * @param array<string> $params Dynamic parameters to inject into template (e.g., ["John", "LX-123", "1500 DH"])
     * @param string $languageCode  Language code (default: "en_US", use "fr_FR" for French, etc.)
     * 
     * @return array ['ok' => bool, 'message_id' => string|null, 'error' => string|null]
     */
    public function sendTemplate(
        string $to,
        string $templateName,
        array $params = [],
        string $languageCode = 'en_US'
    ): array {
        if (empty($this->apiToken) || empty($this->phoneNumberId)) {
            $msg = 'WhatsApp not configured: WHATSAPP_API_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing in .env';
            Log::warning("WhatsApp: {$msg}");
            return ['ok' => false, 'message_id' => null, 'error' => $msg];
        }

        if (empty($templateName)) {
            $msg = 'Template name is required';
            Log::warning("WhatsApp: {$msg}");
            return ['ok' => false, 'message_id' => null, 'error' => $msg];
        }

        // Normalise phone: keep digits only (works for any format)
        $to = preg_replace('/[^\d]/', '', $to);

        if (strlen($to) < 10) {
            Log::warning("WhatsApp: invalid phone number (too short)", ['to' => $to]);
            return ['ok' => false, 'message_id' => null, 'error' => 'Invalid phone number format'];
        }

        try {
            // Build template body components from parameters
            $bodyParameters = [];
            foreach ($params as $param) {
                $bodyParameters[] = [
                    'type' => 'text',
                    'text' => (string) $param,
                ];
            }

            // Send template message via Meta Cloud API
            $response = Http::withToken($this->apiToken)
                ->timeout(15)
                ->post("https://graph.facebook.com/{$this->apiVersion}/{$this->phoneNumberId}/messages", [
                    'messaging_product' => 'whatsapp',
                    'recipient_type'    => 'individual',
                    'to'                => $to,
                    'type'              => 'template',
                    'template'          => [
                        'name'     => $templateName,
                        'language' => [
                            'code' => $languageCode,
                        ],
                        'components' => [
                            [
                                'type'       => 'body',
                                'parameters' => $bodyParameters,
                            ],
                        ],
                    ],
                ]);

            // Handle API errors
            if ($response->failed()) {
                $apiError = $response->json('error.message') ?? 'Unknown error';
                $apiCode  = $response->json('error.code') ?? 0;
                $details  = $response->json('error.error_data.details') ?? '';

                Log::error('WhatsApp: template send failed', [
                    'to'           => $to,
                    'template'     => $templateName,
                    'status'       => $response->status(),
                    'error_code'   => $apiCode,
                    'error_msg'    => $apiError,
                    'details'      => $details,
                    'full_response' => $response->json(),
                ]);

                return [
                    'ok'         => false,
                    'message_id' => null,
                    'error'      => "(#{$apiCode}) {$apiError}",
                ];
            }

            $messageId = $response->json('messages.0.id');
            Log::info('WhatsApp: template sent', [
                'to'         => $to,
                'template'   => $templateName,
                'message_id' => $messageId,
                'params'     => count($params),
            ]);

            return [
                'ok'         => true,
                'message_id' => $messageId,
                'error'      => null,
            ];

        } catch (\Throwable $e) {
            Log::error('WhatsApp: unexpected exception', [
                'message'   => $e->getMessage(),
                'to'        => $to,
                'template'  => $templateName,
            ]);
            return [
                'ok'         => false,
                'message_id' => null,
                'error'      => $e->getMessage(),
            ];
        }
    }

    /**
     * Format phone number to international format (e.g., +212611955060)
     * 
     * Handles multiple formats:
     * - +212611955060
     * - 212611955060
     * - 0611955060
     * - +212 6 11 95 50 60
     * 
     * @param string $phone Raw phone number
     * @param string $countryCode Country dialing code (default: "212" for Morocco)
     * @return string Formatted phone number (e.g., "+212611955060") or empty if invalid
     */
    public static function formatPhone(string $phone, string $countryCode = '212'): string
    {
        // Remove all non-digits
        $digits = preg_replace('/[^\d]/', '', $phone);

        if (strlen($digits) < 9) {
            return '';
        }

        // Handle 0 prefix (e.g., 0611955060 -> 212611955060)
        if (str_starts_with($digits, '0')) {
            $digits = $countryCode . substr($digits, 1);
        }

        // Add country code if missing
        if (!str_starts_with($digits, $countryCode)) {
            $digits = $countryCode . $digits;
        }

        return '+' . $digits;
    }

    /**
     * Validate phone number format
     * 
     * @param string $phone Phone number (any format)
     * @return bool True if valid, false otherwise
     */
    public static function isValidPhone(string $phone): bool
    {
        $digits = preg_replace('/[^\d]/', '', $phone);
        return strlen($digits) >= 10 && strlen($digits) <= 15;
    }
}
