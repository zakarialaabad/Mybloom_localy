<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\ProcessOpenWaWebhook;
use App\Models\OpenWaWebhookEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OpenWaWebhookController extends Controller
{
    public function handle(Request $request): JsonResponse
    {
        $raw = $request->getContent();
        $secret = (string) config('services.openwa.webhook_secret');
        $signature = (string) $request->header('X-OpenWA-Signature');
        // OpenWA signs the exact serialized request body and prefixes the
        // digest with `sha256=`. Do not decode/re-encode JSON before this
        // check: changing whitespace or key order would invalidate it.
        $expected = $secret === '' ? '' : 'sha256='.hash_hmac('sha256', $raw, $secret);
        if ($secret === '' || $signature === '' || ! hash_equals($expected, $signature)) {
            return response()->json(['message' => 'Invalid webhook signature.'], 401);
        }

        $payload = json_decode($raw, true);
        if (! is_array($payload)) {
            return response()->json(['message' => 'Invalid webhook payload.'], 422);
        }
        $type = (string) ($payload['event'] ?? $payload['type'] ?? data_get($payload, 'data.event') ?? '');
        if (! in_array($type, ['message.ack', 'message.received', 'message.failed', 'session.disconnected', 'session.status'], true)) {
            return response()->json(['accepted' => true], 202);
        }

        $session = (string) ($payload['sessionId'] ?? data_get($payload, 'data.sessionId') ?? '');
        $eventKey = (string) ($payload['idempotencyKey'] ?? $payload['deliveryId'] ?? $payload['id'] ?? $payload['eventId'] ?? '');
        if ($eventKey === '') {
            $eventKey = hash('sha256', $type.'|'.$session.'|'.$raw);
        }

        $event = DB::transaction(function () use ($eventKey, $type, $session, $payload) {
            $event = OpenWaWebhookEvent::firstOrCreate(['event_key' => $eventKey], [
                'event_type' => $type, 'session_id' => $session ?: null, 'payload' => $payload,
            ]);
            if ($event->wasRecentlyCreated) {
                ProcessOpenWaWebhook::dispatch($event->id)->afterCommit();
            }

            return $event;
        });

        return response()->json(['accepted' => true, 'duplicate' => ! $event->wasRecentlyCreated], 202);
    }
}
