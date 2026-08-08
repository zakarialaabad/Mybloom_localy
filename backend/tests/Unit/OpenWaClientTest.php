<?php

namespace Tests\Unit;

use App\Services\OpenWa\OpenWaClient;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class OpenWaClientTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        config()->set('services.openwa.enabled', true);
        config()->set('services.openwa.base_url', 'http://openwa.test/api');
        config()->set('services.openwa.api_key', 'test-key');
        config()->set('services.openwa.session_id', 'mybloom-owner');
        config()->set('services.openwa.owner_e164', '212639760141');
        config()->set('services.openwa.webhook_secret', 'webhook-test-secret');
    }

    public function test_it_uses_the_returned_canonical_id_and_never_constructs_a_chat_id(): void
    {
        Http::fake([
            'http://openwa.test/api/sessions/mybloom-owner/contacts/check/212720356971' => Http::response(['isRegistered' => true, 'whatsappId' => 'canonical@lid']),
            'http://openwa.test/api/sessions/mybloom-owner/messages/send-text' => Http::response(['messageId' => 'message-1'], 201),
        ]);
        $client = new OpenWaClient;
        $contact = $client->checkCustomerNumber('212720356971');
        $client->sendText($contact['whatsappId'], 'bonjour');
        Http::assertSent(fn ($request) => $request->url() === 'http://openwa.test/api/sessions/mybloom-owner/messages/send-text'
            && $request['chatId'] === 'canonical@lid' && $request->hasHeader('X-API-Key', 'test-key'));
    }

    public function test_it_registers_the_hmac_secret_with_the_webhook(): void
    {
        Http::fake(['http://openwa.test/api/sessions/mybloom-owner/webhooks' => Http::response([], 201)]);
        (new OpenWaClient)->registerWebhook('https://mybloom.test/api/v1/webhooks/openwa', ['message.ack']);
        Http::assertSent(fn ($request) => $request['secret'] === 'webhook-test-secret' && $request['events'] === ['message.ack']);
    }
}
