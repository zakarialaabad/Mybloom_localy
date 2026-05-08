<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;

/**
 * Gmail API service — uses OAuth2 refresh token + Gmail REST API.
 * Scope: https://www.googleapis.com/auth/gmail.send
 * Requires: GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN in .env
 */
class GmailService
{
    private Client $http;
    private string $clientId;
    private string $clientSecret;
    private string $refreshToken;
    private string $fromAddress;
    private string $fromName;

    public function __construct()
    {
        $this->http          = new Client(['timeout' => 30]);
        $this->clientId      = config('services.google.client_id', env('GOOGLE_CLIENT_ID', ''));
        $this->clientSecret  = config('services.google.client_secret', env('GOOGLE_CLIENT_SECRET', ''));
        $this->refreshToken  = config('services.google.refresh_token', env('GOOGLE_REFRESH_TOKEN', ''));
        $this->fromAddress   = env('MAIL_FROM_ADDRESS', 'zakarialaalbad200@gmail.com');
        $this->fromName      = env('MAIL_FROM_NAME', 'Parfum Store');
    }

    /**
     * Exchange refresh token for a fresh access token.
     */
    private function getAccessToken(): string
    {
        $response = $this->http->post('https://oauth2.googleapis.com/token', [
            'form_params' => [
                'client_id'     => $this->clientId,
                'client_secret' => $this->clientSecret,
                'refresh_token' => $this->refreshToken,
                'grant_type'    => 'refresh_token',
            ],
        ]);

        $data = json_decode($response->getBody()->getContents(), true);

        if (empty($data['access_token'])) {
            throw new \RuntimeException('[GmailService] Failed to obtain access token: ' . json_encode($data));
        }

        Log::info('[GmailService] Access token obtained successfully.');
        return $data['access_token'];
    }

    /**
     * Build a RFC 2822 MIME email message (with optional PDF attachment).
     */
    private function buildMimeMessage(
        string $to,
        string $subject,
        string $htmlBody,
        ?string $pdfContent = null,
        ?string $pdfFilename = null
    ): string {
        $from      = "{$this->fromName} <{$this->fromAddress}>";
        $boundary  = '==Boundary_' . md5(uniqid((string) rand(), true));
        $subject64 = '=?UTF-8?B?' . base64_encode($subject) . '?=';

        $mime  = "From: {$from}\r\n";
        $mime .= "To: {$to}\r\n";
        $mime .= "Subject: {$subject64}\r\n";
        $mime .= "MIME-Version: 1.0\r\n";

        if ($pdfContent && $pdfFilename) {
            $mime .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n\r\n";

            // HTML Part
            $mime .= "--{$boundary}\r\n";
            $mime .= "Content-Type: text/html; charset=UTF-8\r\n";
            $mime .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $mime .= chunk_split(base64_encode($htmlBody)) . "\r\n";

            // PDF Attachment Part
            $mime .= "--{$boundary}\r\n";
            $mime .= "Content-Type: application/pdf; name=\"{$pdfFilename}\"\r\n";
            $mime .= "Content-Disposition: attachment; filename=\"{$pdfFilename}\"\r\n";
            $mime .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $mime .= chunk_split(base64_encode($pdfContent)) . "\r\n";

            $mime .= "--{$boundary}--";
        } else {
            $mime .= "Content-Type: text/html; charset=UTF-8\r\n";
            $mime .= "Content-Transfer-Encoding: base64\r\n\r\n";
            $mime .= chunk_split(base64_encode($htmlBody));
        }

        // Gmail API requires URL-safe base64 with no padding
        return rtrim(strtr(base64_encode($mime), '+/', '-_'), '=');
    }

    /**
     * Send email via Gmail REST API.
     *
     * @param  string      $to          Recipient email
     * @param  string      $subject     Email subject
     * @param  string      $htmlBody    HTML content
     * @param  string|null $pdfContent  Raw PDF binary (null = no attachment)
     * @param  string|null $pdfFilename Attachment filename
     */
    public function sendEmail(
        string $to,
        string $subject,
        string $htmlBody,
        ?string $pdfContent = null,
        ?string $pdfFilename = null
    ): void {
        $accessToken = $this->getAccessToken();
        $rawMessage  = $this->buildMimeMessage($to, $subject, $htmlBody, $pdfContent, $pdfFilename);

        $response = $this->http->post(
            'https://www.googleapis.com/gmail/v1/users/me/messages/send',
            [
                'headers' => [
                    'Authorization' => "Bearer {$accessToken}",
                    'Content-Type'  => 'application/json',
                ],
                'json' => ['raw' => $rawMessage],
            ]
        );

        $result = json_decode($response->getBody()->getContents(), true);
        Log::info("[GmailService] Email sent via Gmail API to {$to} — messageId: " . ($result['id'] ?? 'unknown'));
    }
}
