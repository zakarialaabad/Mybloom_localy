---
name: mybloom-openwa-admin-order-notification
description: Inspect, implement, test, and diagnose a local MyBloom workflow where the WhatsApp account +212639760141 is linked to rmyndharis/OpenWA and sends one internal order notification for every successfully saved website order to the personal admin number +212611955060. The recipient is fixed, already saved in contacts, and has existing chat history. Do not message customers in this workflow and do not use Meta Cloud API.
compatibility: MyBloom local e-commerce project, preferably Laravel backend with any frontend; Docker Desktop or Docker Engine; rmyndharis/OpenWA from open-wa.org; local API exposed under /api.
metadata:
  author: mybloom
  version: "1.0.0"
  scope: local-development
  provider: rmyndharis-openwa
---

# MyBloom OpenWA Admin Order Notification

## Mission

Implement and verify this exact internal-notification workflow:

```text
Customer submits an order on the current MyBloom website
        -> backend validates the checkout
        -> order and order items are saved successfully
        -> database transaction commits
        -> one queued job is dispatched for that order
        -> OpenWA session linked to +212639760141 sends the message
        -> fixed admin recipient +212611955060 receives the notification
        -> message id and delivery status are recorded
```

The WhatsApp notification must tell the admin that a new customer placed an order and include the saved order information.

## Fixed phone-number roles

These roles must never be reversed:

```text
OpenWA sender account:       +212639760141
Sender digits:               212639760141

Admin notification receiver: +212611955060
Receiver digits:             212611955060
Expected neutral JID:        212611955060@c.us
```

Rules:

1. `+212639760141` authenticates the OpenWA session by QR or pairing code.
2. OpenWA determines the sender from the linked session. Do not send a `from` field.
3. `+212611955060` is the only recipient for this skill.
4. Do not take the WhatsApp recipient from the customer's checkout phone.
5. Do not send an order confirmation to the customer in this workflow.
6. The admin recipient already exists in contacts and has previous chat history with the sender, so this workflow does not depend on cold first-contact delivery.
7. Still verify the recipient through OpenWA and use the returned canonical `whatsappId` instead of assuming the JID forever.

## Correct OpenWA project

Target only this project:

```text
Website:       https://www.open-wa.org/
Repository:    https://github.com/rmyndharis/OpenWA
Documentation: https://docs.open-wa.org/
```

Default local addresses in the current repository:

```text
API:       http://localhost:2785/api
Swagger:   http://localhost:2785/api/docs
Dashboard: http://localhost:2886
```

Do not substitute the separate `@open-wa/wa-automate` package or the `docs.openwa.dev` API. Its commands, endpoints, and payloads are different.

The installed OpenWA Swagger page is the final source of truth when its schema differs from examples in this skill.

## Technical conclusion from the investigation

The old customer-notification problem is not relevant to this design because the recipient is now one fixed admin number with an established chat.

The reliable path is:

```text
linked sender session + fixed existing admin chat + low volume + server-side REST call
```

A successful REST response means OpenWA accepted the request. For stronger confirmation, track `message.ack`:

```text
pending   = queued locally
sent      = reached WhatsApp servers
delivered = reached +212611955060
read      = read by the admin
failed    = sending failed
```

Do not roll back an order if WhatsApp is unavailable.

# Phase 1 — Inspect the actual MyBloom project

Before changing code, identify and report:

- Frontend framework and checkout form.
- Backend framework and version.
- Exact controller, action, service, or command that creates orders.
- Database transaction boundary.
- `orders` and `order_items` tables and model relationships.
- Saved order reference field.
- Customer name, phone, city, address, delivery, and notes fields.
- Product snapshot fields, quantity, price, and line total.
- Subtotal, discount, delivery fee, tax, and total source of truth.
- Payment method and payment status fields.
- Existing queue configuration and worker command.
- Existing notification code and existing OpenWA configuration.
- Existing duplicate-prevention or notification-status fields.

Search for and remove incorrect behavior such as:

```text
customer phone used as the notification recipient
OPENWA_CUSTOMER_CHAT_ID used for admin alerts
sender and receiver numbers reversed
fixed data prepared before the order commits
WhatsApp request executed inside the checkout transaction
WhatsApp failure deleting or cancelling an order
notification dispatched from a confirmation-page refresh
same order notification sent more than once
API key exposed in Next.js or browser JavaScript
HTTP 201 immediately stored as delivered
```

Do not guess database field names. Adapt the implementation to the real repository.

# Phase 2 — Run OpenWA locally

## Requirements

```text
Docker with Compose v2
Git
WhatsApp account +212639760141
Access to the phone for Linked devices
Local MyBloom backend
```

## Start the correct OpenWA project

```bash
git clone https://github.com/rmyndharis/OpenWA.git
cd OpenWA
docker compose -f docker-compose.dev.yml up -d
```

Check services and logs:

```bash
docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs --tail=150
```

Check health:

```bash
curl http://localhost:2785/api/health
curl http://localhost:2785/api/health/ready
```

Open:

```text
http://localhost:2886
http://localhost:2785/api/docs
```

## Obtain the API key

On first boot, OpenWA writes the first admin key to `data/.api-key`.

Linux/macOS:

```bash
cat data/.api-key
```

Windows PowerShell:

```powershell
Get-Content .\data\.api-key
```

The key should normally begin with `owa_k1_`.

Use the admin key only to create a lower-privilege operator key scoped to the single MyBloom session when the installed Swagger supports it. Store the integration key in the Laravel backend only.

## Create the sender session

```bash
export OPENWA_API_KEY="owa_k1_REPLACE_ME"

curl -X POST http://localhost:2785/api/sessions \
  -H "X-API-Key: $OPENWA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"mybloom-admin-sender-local"}'
```

Copy the returned session `id`. Do not confuse it with the friendly session name.

```bash
export OPENWA_SESSION_ID="REPLACE_WITH_RETURNED_ID"

curl -X POST \
  "http://localhost:2785/api/sessions/$OPENWA_SESSION_ID/start" \
  -H "X-API-Key: $OPENWA_API_KEY"
```

Get the QR through the dashboard or API, then scan it using WhatsApp account `+212639760141`:

```text
WhatsApp -> Settings -> Linked devices -> Link a device
```

Poll the session:

```bash
curl \
  "http://localhost:2785/api/sessions/$OPENWA_SESSION_ID" \
  -H "X-API-Key: $OPENWA_API_KEY"
```

Acceptance conditions:

```text
status = ready
linked phone = 212639760141
```

Abort testing if a different WhatsApp account is connected.

# Phase 3 — Verify the fixed admin recipient

Check the personal admin number with digits only:

```bash
curl \
  "http://localhost:2785/api/sessions/$OPENWA_SESSION_ID/contacts/check/212611955060" \
  -H "X-API-Key: $OPENWA_API_KEY"
```

Expected result:

```json
{
  "number": "212611955060",
  "exists": true,
  "whatsappId": "212611955060@c.us"
}
```

Use the returned `whatsappId`. It is the canonical recipient identifier and could differ in future WhatsApp identity formats.

The number being saved in contacts and having chat history is helpful, but the application must verify `exists: true` and fail clearly if it is false.

## Manual send test

```bash
curl -X POST \
  "http://localhost:2785/api/sessions/$OPENWA_SESSION_ID/messages/send-text" \
  -H "X-API-Key: $OPENWA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "chatId": "212611955060@c.us",
    "text": "MyBloom local test: admin order notifications are connected."
  }'
```

Do not continue to website integration until this message arrives at `+212611955060`.

# Phase 4 — Configure the MyBloom backend

Add server-only values to Laravel `.env`:

```env
OPENWA_ENABLED=true
OPENWA_BASE_URL=http://127.0.0.1:2785/api
OPENWA_API_KEY=owa_k1_REPLACE_ME
OPENWA_SESSION_ID=REPLACE_WITH_RETURNED_SESSION_ID
OPENWA_SENDER_PHONE=212639760141
OPENWA_ADMIN_RECIPIENT_PHONE=212611955060
OPENWA_WEBHOOK_SECRET=replace-with-a-long-random-value
```

Connection alternatives:

```text
Laravel on host + OpenWA on host/container with published port:
http://127.0.0.1:2785/api

Laravel in Docker + OpenWA on host, Windows/macOS:
http://host.docker.internal:2785/api

Laravel and OpenWA in the same Compose network:
http://<openwa-service-name>:2785/api
```

Never use `NEXT_PUBLIC_` for OpenWA secrets.

Add to `config/services.php`:

```php
'openwa' => [
    'enabled' => env('OPENWA_ENABLED', false),
    'base_url' => env('OPENWA_BASE_URL', 'http://127.0.0.1:2785/api'),
    'api_key' => env('OPENWA_API_KEY'),
    'session_id' => env('OPENWA_SESSION_ID'),
    'sender_phone' => env('OPENWA_SENDER_PHONE', '212639760141'),
    'admin_recipient_phone' => env('OPENWA_ADMIN_RECIPIENT_PHONE', '212611955060'),
    'webhook_secret' => env('OPENWA_WEBHOOK_SECRET'),
],
```

Then run:

```bash
php artisan config:clear
```

# Phase 5 — Add notification tracking

Prefer dedicated fields on `orders` unless the project already has a notification table:

```text
admin_whatsapp_status           nullable string
admin_whatsapp_message_id       nullable string, indexed
admin_whatsapp_attempted_at      nullable timestamp
admin_whatsapp_delivered_at      nullable timestamp
admin_whatsapp_read_at           nullable timestamp
admin_whatsapp_failure_reason    nullable text
```

Recommended status values:

```text
queued
accepted
sent
delivered
read
failed
skipped
```

Do not use the customer's WhatsApp status fields for this internal notification.

# Phase 6 — Implement the OpenWA client service

Create a service such as:

```text
app/Services/OpenWaAdminNotifier.php
```

Responsibilities:

1. Validate required configuration.
2. Confirm OpenWA health when diagnosing.
3. Confirm the session is `ready`.
4. Confirm the session belongs to `212639760141` when the API exposes the linked phone.
5. Resolve `212611955060` with the contacts check endpoint.
6. Cache the returned admin `whatsappId` briefly to avoid repeating the lookup for every order.
7. Send one text message to that fixed JID.
8. Return the OpenWA `messageId`.
9. Throw typed exceptions for retryable and permanent failures.
10. Never accept a recipient argument from checkout data.

Laravel-oriented implementation pattern:

```php
<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class OpenWaAdminNotifier
{
    private function client(): PendingRequest
    {
        return Http::acceptJson()
            ->withHeaders([
                'X-API-Key' => (string) config('services.openwa.api_key'),
            ])
            ->connectTimeout(3)
            ->timeout(15)
            ->retry(2, 500, throw: false);
    }

    public function resolveAdminChatId(): string
    {
        return Cache::remember(
            'openwa.admin-recipient-chat-id',
            now()->addHours(12),
            function (): string {
                $baseUrl = rtrim((string) config('services.openwa.base_url'), '/');
                $sessionId = (string) config('services.openwa.session_id');
                $phone = (string) config('services.openwa.admin_recipient_phone');

                $response = $this->client()->get(
                    "{$baseUrl}/sessions/{$sessionId}/contacts/check/{$phone}"
                );

                if (!$response->successful() || $response->json('exists') !== true) {
                    throw new RuntimeException('Admin recipient is not available on WhatsApp.');
                }

                $chatId = $response->json('whatsappId');

                if (!is_string($chatId) || $chatId === '') {
                    throw new RuntimeException('OpenWA did not return the admin whatsappId.');
                }

                return $chatId;
            }
        );
    }

    public function send(string $text): string
    {
        if (!config('services.openwa.enabled')) {
            throw new RuntimeException('OpenWA admin notifications are disabled.');
        }

        $baseUrl = rtrim((string) config('services.openwa.base_url'), '/');
        $sessionId = (string) config('services.openwa.session_id');
        $chatId = $this->resolveAdminChatId();

        $response = $this->client()->post(
            "{$baseUrl}/sessions/{$sessionId}/messages/send-text",
            [
                'chatId' => $chatId,
                'text' => $text,
            ]
        );

        if (!$response->successful()) {
            throw new RuntimeException(
                'OpenWA send failed: HTTP ' . $response->status() . ' ' . $response->body()
            );
        }

        $messageId = $response->json('messageId') ?? $response->json('id');

        if (!is_string($messageId) || $messageId === '') {
            throw new RuntimeException('OpenWA accepted the request without a message id.');
        }

        return $messageId;
    }
}
```

Adapt the response keys to the installed `/api/docs` schema.

# Phase 7 — Build the admin order message from saved data

The message must use the persisted order and persisted order-item snapshots, not untrusted values sent by the browser.

Recommended French message:

```text
🛍️ Nouvelle commande MyBloom

Commande : #MB-1058
Date : 05/08/2026 14:02

Client : Sara El Amrani
Téléphone : +212 7XX-XXX-XXX
Ville : Casablanca
Adresse : ...

Produits :
• Heartbeat Body Mist × 2 — 398,00 MAD
• Body Butter × 1 — 149,00 MAD

Sous-total : 547,00 MAD
Livraison : 30,00 MAD
Remise : 0,00 MAD
Total : 577,00 MAD

Paiement : Paiement à la livraison
Statut : Nouvelle commande
```

Optionally include a local or authenticated admin order URL only when it is reachable from the admin's phone and does not expose a secret token.

Do not include:

- Passwords.
- Card details.
- API keys.
- Session identifiers.
- Raw database dumps.
- A public invoice link intended for the customer unless the admin specifically needs it.

# Phase 8 — Dispatch after the order commits

Create a queued job such as:

```text
app/Jobs/SendAdminOrderNotification.php
```

Required behavior:

- Implements `ShouldQueue`.
- Prefer `ShouldBeUnique` with order id as the unique id.
- Reloads the order and items from the database.
- Exits when `admin_whatsapp_delivered_at` or `admin_whatsapp_read_at` is already set.
- Builds the message from saved data.
- Stores `queued` before dispatch when appropriate.
- Stores `accepted`, `messageId`, and `attempted_at` after a successful REST call.
- Stores a sanitized failure reason on final failure.
- Retries transient connection, `409`, `429`, and `5xx` errors with backoff.
- Does not retry permanent bad-configuration errors forever.

Suggested retry policy:

```php
public int $tries = 4;

public function backoff(): array
{
    return [10, 30, 90, 180];
}

public function uniqueId(): string
{
    return 'admin-order-whatsapp:' . $this->orderId;
}
```

Dispatch only after a successful database commit:

```php
$order = DB::transaction(function () use ($validatedData) {
    // Create order and order items.
    return $order;
});

SendAdminOrderNotification::dispatch($order->id)->afterCommit();
```

Or use an `OrderCreated` domain event whose listener is queued and configured after commit.

Forbidden logic:

```php
// Wrong: checkout fails when WhatsApp is offline.
DB::transaction(function () {
    $order = createOrder();
    sendWhatsAppOrThrow($order);
});
```

# Phase 9 — Delivery acknowledgements

For operational certainty, register an OpenWA webhook for:

```text
message.ack
message.failed
session.status
```

The local Laravel webhook URL must be reachable from the OpenWA container.

Examples:

```text
Laravel on host, OpenWA in Docker on Windows/macOS:
http://host.docker.internal:8000/api/openwa/events

Both services in one Compose network:
http://backend:8000/api/openwa/events
```

Register the webhook through the installed Swagger/API with a strong secret. OpenWA signs requests in `X-OpenWA-Signature` as `sha256=<hmac>` when a secret is configured.

The receiver must:

1. Read the raw request body before JSON transformation.
2. Calculate HMAC-SHA256 with `OPENWA_WEBHOOK_SECRET`.
3. Compare signatures with `hash_equals`.
4. Reject invalid signatures.
5. Ignore events for a different session.
6. Find the order by `admin_whatsapp_message_id`.
7. Update status monotonically:

```text
pending -> sent -> delivered -> read
       \-> failed
```

Do not downgrade `read` to `delivered` or `delivered` to `sent` when events arrive out of order.

For a minimal local implementation, accepted-send tracking is enough to begin, but delivery/read tracking is the correct final design.

# Phase 10 — Local tests

## Unit tests

Test that:

- Sender config is exactly `212639760141`.
- Recipient config is exactly `212611955060`.
- Customer phone is never passed as recipient.
- Recipient lookup returns and uses the canonical `whatsappId`.
- Missing or invalid OpenWA configuration fails clearly.
- Message formatting uses persisted order data.
- The same order cannot be notified twice.
- A WhatsApp failure does not delete or roll back an order.

## HTTP fake tests

Fake these requests:

```text
GET  /api/sessions/{id}/contacts/check/212611955060
POST /api/sessions/{id}/messages/send-text
```

Assert that `send-text` receives:

```json
{
  "chatId": "212611955060@c.us",
  "text": "...saved order details..."
}
```

Assert that it never receives the customer's checkout number as `chatId`.

## End-to-end local acceptance test

1. Start OpenWA.
2. Confirm `/api/health/ready` succeeds.
3. Confirm the session is `ready` and linked to `+212639760141`.
4. Confirm contact check for `212611955060` returns `exists: true`.
5. Start Laravel.
6. Start the queue worker.
7. Place one test order through the actual website checkout.
8. Confirm the order and items exist in the database.
9. Confirm one queued job runs.
10. Confirm `+212611955060` receives one WhatsApp notification.
11. Confirm the message contains the exact saved order data.
12. Refresh the confirmation page and verify no duplicate arrives.
13. Re-run the job and verify idempotency prevents another send.
14. Stop OpenWA, place another test order, and verify the order remains saved while the job retries.
15. Restart OpenWA and verify the retry sends the pending notification.

# Phase 11 — Required local commands

Typical terminals:

```text
Terminal 1: OpenWA Docker logs
Terminal 2: Laravel server
Terminal 3: Laravel queue worker
Terminal 4: Frontend development server, if separate
```

Examples:

```bash
# OpenWA
docker compose -f docker-compose.dev.yml logs -f

# Laravel
php artisan serve

# Queue
php artisan queue:work --tries=4 --backoff=10

# Frontend
npm run dev
```

# Troubleshooting order

When no notification arrives, diagnose in this order:

1. Was the order committed to the database?
2. Was exactly one notification job created?
3. Is the queue worker running?
4. Does Laravel have the current uncached `.env` values?
5. Does `GET /api/health/ready` succeed?
6. Is the OpenWA session `ready`?
7. Is the session linked to `212639760141`?
8. Does contact check for `212611955060` return `exists: true`?
9. What canonical `whatsappId` was returned?
10. Did `send-text` return a `messageId`?
11. Is there a `message.failed` or `message.ack` event?
12. Did idempotency incorrectly mark the order as already sent?
13. Is Laravel inside Docker and incorrectly calling its own `127.0.0.1`?
14. Did OpenWA return `401`, `403`, `409`, `429`, or `5xx`?

Useful commands:

```bash
curl http://localhost:2785/api/health/ready

docker compose -f docker-compose.dev.yml ps
docker compose -f docker-compose.dev.yml logs --tail=200

php artisan config:clear
php artisan queue:restart
php artisan queue:work -vvv
```

# Security and reliability requirements

- Keep the OpenWA API key server-side.
- Use an operator key scoped to the MyBloom session when possible.
- Never expose the OpenWA API directly from frontend JavaScript.
- Never commit the API key or OpenWA auth state.
- Log order id, request id, session id, response status, and sanitized errors.
- Do not log API keys or full webhook secrets.
- Keep the local OpenWA ports restricted to the development machine/network.
- Preserve the OpenWA `data` directory so the linked session survives restarts.
- Add a health indicator for a disconnected sender session.
- Keep message volume low: one internal message per real order.
- OpenWA uses an unofficial WhatsApp connection and therefore has a non-zero account-restriction risk even though this fixed existing-chat workflow is lower risk than cold customer messaging.

# Completion criteria

The implementation is complete only when all statements are true:

```text
[ ] The sender session is linked to +212639760141.
[ ] The fixed recipient is +212611955060.
[ ] The recipient exists on WhatsApp and its canonical whatsappId is used.
[ ] Every successfully committed order dispatches exactly one queued notification.
[ ] The message is built from saved order and item data.
[ ] Customer phone numbers are never used as the WhatsApp recipient.
[ ] WhatsApp failure never cancels or deletes an order.
[ ] Duplicate dispatch and retry scenarios do not create duplicate messages.
[ ] The OpenWA message id is stored.
[ ] Delivery/read acknowledgements are tracked when webhooks are enabled.
[ ] A complete local checkout test delivers one correct message to +212611955060.
```

# Official references

Use these as the primary references and re-check the installed Swagger before implementation:

```text
https://github.com/rmyndharis/OpenWA
https://docs.open-wa.org/
https://docs.open-wa.org/guides/authentication/
https://docs.open-wa.org/reference/troubleshooting/
https://docs.open-wa.org/reference/glossary/
http://localhost:2785/api/docs
```
