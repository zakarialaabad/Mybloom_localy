<?php

declare(strict_types=1);

namespace App\Services\OpenWa;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Http\Client\Response;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;

/** Server-side client for rmyndharis/OpenWA's /api contract. */
final class OpenWaClient
{
    public function sessionStatus(): array
    {
        [$body] = $this->request('get', '/sessions/'.$this->sessionId());

        return $body;
    }

    /**
     * Fail closed: automatic customer sends are allowed only when the gateway
     * explicitly reports a ready session authenticated as the owner account.
     */
    public function assertReadyForOwner(): void
    {
        $body = $this->sessionStatus();
        $status = strtolower((string) (data_get($body, 'status') ?? data_get($body, 'data.status') ?? ''));
        $phone = $this->digits((string) (
            data_get($body, 'phone') ?? data_get($body, 'data.phone') ?? data_get($body, 'me.phone') ?? data_get($body, 'data.me.phone') ?? ''
        ));

        if ($status !== 'ready') {
            throw new OpenWaException('OpenWA session is not ready.', true, null, 'session_not_ready');
        }

        if ($phone === '' || ! hash_equals((string) config('services.openwa.owner_e164'), $phone)) {
            throw new OpenWaException('OpenWA session sender is not the configured owner.', false, null, 'session_owner_mismatch');
        }
    }

    /** The internal admin workflow is permanently bound to this sender. */
    public function assertReadyForAdminSender(): void
    {
        if (! hash_equals('212639760141', (string) config('services.openwa.owner_e164'))) {
            throw new OpenWaException('OpenWA admin sender configuration is invalid.', false, null, 'invalid_admin_sender');
        }

        $this->assertReadyForOwner();
    }

    /** @return array{whatsappId:string}|null */
    public function checkCustomerNumber(string $digits): ?array
    {
        if (! preg_match('/^[1-9][0-9]{7,14}$/', $digits)) {
            throw new OpenWaException('Recipient is not E.164 digits.', false, null, 'invalid_number');
        }

        [$body] = $this->request('get', '/sessions/'.$this->sessionId().'/contacts/check/'.rawurlencode($digits));
        $registered = data_get($body, 'exists') ?? data_get($body, 'data.exists')
            ?? data_get($body, 'isRegistered') ?? data_get($body, 'data.isRegistered')
            ?? data_get($body, 'registered');

        // A missing flag must never be treated as a registered contact.  In
        // particular, OpenWA's documented response is `exists`, not a chat
        // lookup: no contact-list or prior-chat requirement is involved.
        if ($registered !== true) {
            return null;
        }

        // Canonical ID is authoritative; intentionally never construct @c.us.
        $chatId = data_get($body, 'whatsappId') ?? data_get($body, 'data.whatsappId') ?? data_get($body, 'contact.whatsappId');
        if (! is_string($chatId) || $chatId === '') {
            throw new OpenWaException('OpenWA contact check did not return a canonical WhatsApp ID.', false, null, 'canonical_id_missing');
        }

        return ['whatsappId' => $chatId];
    }

    /**
     * Resolve only the fixed internal recipient. This method intentionally
     * accepts no caller-supplied phone number, so checkout data can never be
     * used as the admin-notification destination.
     *
     * @return array{whatsappId:string}
     */
    public function resolveAdminRecipient(): array
    {
        $recipient = (string) config('services.openwa.admin_recipient_e164');
        if (! hash_equals('212611955060', $recipient)) {
            throw new OpenWaException('OpenWA admin recipient configuration is invalid.', false, null, 'invalid_admin_recipient');
        }

        return Cache::remember(
            'openwa.admin-recipient-chat-id.'.sha1($this->sessionId()),
            now()->addHours(12),
            function () use ($recipient): array {
                $contact = $this->checkCustomerNumber($recipient);
                if ($contact === null) {
                    throw new OpenWaException('The fixed admin recipient is not available on WhatsApp.', false, null, 'admin_recipient_not_on_whatsapp');
                }

                return $contact;
            },
        );
    }

    public function sendText(string $chatId, string $text): OpenWaSendResult
    {
        return $this->sendTextWithTimeout($chatId, $text, null);
    }

    /**
     * The internal admin path can tolerate a longer gateway response while
     * keeping the existing customer-notification timeout unchanged.
     */
    public function sendAdminText(string $chatId, string $text): OpenWaSendResult
    {
        return $this->sendTextWithTimeout(
            $chatId,
            $text,
            (int) config('services.openwa.admin_request_timeout'),
        );
    }

    private function sendTextWithTimeout(string $chatId, string $text, ?int $timeout): OpenWaSendResult
    {
        [$body, $httpStatus] = $this->request('post', '/sessions/'.$this->sessionId().'/messages/send-text', [
            'chatId' => $chatId,
            'text' => $text,
        ], $timeout);

        return new OpenWaSendResult($this->extractMessageId($body), $httpStatus, $body);
    }

    public function registerWebhook(string $url, array $events): void
    {
        $secret = (string) config('services.openwa.webhook_secret');
        if ($secret === '') {
            throw new OpenWaException('OpenWA webhook secret is missing.', false, null, 'missing_webhook_secret');
        }
        $this->request('post', '/sessions/'.$this->sessionId().'/webhooks', [
            'url' => $url,
            'events' => array_values($events),
            'secret' => $secret,
        ]);
    }

    /** @return array{0: array, 1: int} */
    private function request(string $method, string $path, array $payload = [], ?int $timeout = null): array
    {
        $this->ensureConfigured();
        try {
            $request = Http::acceptJson()
                ->withHeader('X-API-Key', (string) config('services.openwa.api_key'))
                ->connectTimeout((int) config('services.openwa.connect_timeout'))
                ->timeout($timeout ?? (int) config('services.openwa.request_timeout'));
            $response = $method === 'get'
                ? $request->get(rtrim((string) config('services.openwa.base_url'), '/').$path)
                : $request->asJson()->post(rtrim((string) config('services.openwa.base_url'), '/').$path, $payload);
        } catch (ConnectionException) {
            throw new OpenWaException('OpenWA could not be reached.', true, null, 'connection_unknown');
        }

        $body = is_array($response->json()) ? $response->json() : [];
        if (! $response->successful()) {
            throw $this->exceptionFromResponse($response, $body);
        }

        return [$body, $response->status()];
    }

    private function ensureConfigured(): void
    {
        if (! config('services.openwa.enabled') || blank(config('services.openwa.api_key'))) {
            throw new OpenWaException('OpenWA is not configured.', false, null, 'provider_not_configured');
        }
    }

    private function sessionId(): string
    {
        $id = (string) config('services.openwa.session_id');
        if ($id === '') {
            throw new OpenWaException('OpenWA session ID is missing.', false, null, 'missing_session_id');
        }

        return rawurlencode($id);
    }

    private function exceptionFromResponse(Response $response, array $body): OpenWaException
    {
        $status = $response->status();
        $code = match (true) {
            $status === 409 => 'session_conflict',
            $status === 429 => 'rate_limited',
            $status >= 500 => 'openwa_server_error',
            $status === 401 || $status === 403 => 'openwa_auth_failed',
            default => 'openwa_request_failed',
        };

        return new OpenWaException((string) (data_get($body, 'message') ?: 'OpenWA request failed.'), in_array($status, [409, 429], true) || $status >= 500, $status, $code);
    }

    private function extractMessageId(array $body): ?string
    {
        foreach (['messageId', 'message_id', 'id'] as $key) {
            if (is_scalar($body[$key] ?? null) && (string) $body[$key] !== '') {
                return (string) $body[$key];
            }
        }
        foreach (['data', 'message', 'result'] as $key) {
            if (is_array($body[$key] ?? null) && ($id = $this->extractMessageId($body[$key])) !== null) {
                return $id;
            }
        }

        return null;
    }

    private function digits(string $value): string
    {
        return preg_replace('/\D+/', '', $value) ?? '';
    }
}
