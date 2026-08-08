---
name: mybloom-openwa-local-order-confirmation
description: Deeply inspect, implement, test, and diagnose a local MyBloom order-confirmation workflow using the rmyndharis/OpenWA gateway from open-wa.org, without Meta Cloud API fees. Link the owner number +212639760141 as the sender, dynamically message the customer number entered at checkout, include complete saved order information and a secure invoice link, track real WhatsApp delivery acknowledgements, and provide a free customer-initiated fallback for brand-new numbers whose first automatic message is dropped by WhatsApp.
compatibility: MyBloom local e-commerce project, preferably Next.js frontend plus Laravel backend; Docker Desktop or Docker Engine; rmyndharis/OpenWA v0.13.x or the locally installed version exposed at /api/docs.
metadata:
  author: mybloom
  version: "3.0.0"
  scope: local-development
  provider: rmyndharis-openwa
---

# MyBloom OpenWA Local Order Confirmation

## Mission

Implement and verify this local workflow:

```text
Customer submits checkout
        -> backend validates and saves the order and line items
        -> backend generates a secure invoice download URL
        -> database transaction commits
        -> queued job normalizes and verifies the customer number
        -> OpenWA session authenticated as +212639760141 sends the message
        -> OpenWA returns a messageId
        -> webhook updates sent/delivered/read/failed state
```

The customer-facing message must include:

1. Order confirmation.
2. Saved order reference.
3. Customer name and delivery information.
4. Every ordered product, quantity, unit price, and line total.
5. Subtotal, discount, delivery fee, and final total when available.
6. Payment method and payment status.
7. A secure invoice download link.

## Non-negotiable truth

OpenWA is free and self-hosted, but it connects through an unofficial WhatsApp interface. Application code can send to a valid new WhatsApp number without saving it in the owner's contacts and without checking for an existing chat. However, WhatsApp may silently drop a first-ever message to a brand-new contact even when OpenWA returns HTTP 201 and a messageId.

Therefore:

```text
OpenWA HTTP 201 = accepted by the local gateway
message.ack sent = reached WhatsApp servers
message.ack delivered = reached the customer's device
message.ack read = opened/read by the customer
```

Never label an order notification as delivered merely because the HTTP request returned 201.

This skill must implement both:

- Automatic best-effort delivery to every valid customer WhatsApp number.
- A free OpenWA-only customer-initiated fallback when delivery is not confirmed.

Do not promise that code can override WhatsApp's server-side first-contact policy.

## Identify the correct project

This skill targets:

```text
Website: https://www.open-wa.org/
Repository: https://github.com/rmyndharis/OpenWA
Documentation: https://docs.open-wa.org/
Local dashboard: http://localhost:2785
Local API base: http://localhost:2785/api
Local Swagger: http://localhost:2785/api/docs
```

Do not substitute the separate `@open-wa/wa-automate` project from `docs.openwa.dev`. Its endpoints and payloads are different.

Use the local Swagger document as the final source of truth because the installed OpenWA version may differ from this guide.

## Sender identity

The MyBloom owner/admin WhatsApp number is:

```text
Human format: +212639760141
Digits: 212639760141
```

The sender is determined by the WhatsApp account linked to the OpenWA session. Do not pass a `from` number in `send-text`.

After linking the session, verify:

```json
{
  "status": "ready",
  "phone": "212639760141"
}
```

Abort customer-message testing if the connected session phone is not `212639760141`.

Use a dedicated test number instead of a critical daily-use business number whenever possible. OpenWA carries a non-zero restriction risk.

# Phase 1 — Inspect the real MyBloom project

Before editing code, identify and report:

- Frontend framework and version.
- Backend framework and version.
- Checkout form component.
- Order creation controller/service/action.
- Order database transaction boundary.
- `orders` and `order_items` schemas.
- Customer phone field.
- Customer name, address, city, and delivery fields.
- Product snapshot fields used at purchase time.
- Total calculation source of truth.
- Invoice controller, PDF generator, storage, and route.
- Queue driver and worker command.
- Existing OpenWA code, package, service, environment variables, and routes.
- Existing notification status columns.
- Existing WhatsApp-consent input.

Search for incorrect logic such as:

```text
contact must exist before send
chat must exist before send
skip when getContactById fails
fixed customer chat id in .env
OPENWA_ADMIN_CHAT_ID used as customer recipient
raw checkout phone sent without normalization
hardcoded @c.us without contacts/check
HTTP 201 marked delivered
WhatsApp failure rolls back or deletes the order
invoice link points to localhost and is opened from a phone
```

Do not guess model or column names. Adapt all examples to the actual repository.

# Phase 2 — Run OpenWA locally

## Recommended Docker path

Prerequisites:

```text
Docker with Compose v2
Git
A phone with WhatsApp
The owner/admin account +212639760141
Laravel and MyBloom local dependencies
```

From a local development directory:

```bash
git clone https://github.com/rmyndharis/OpenWA.git
cd OpenWA
docker compose -f docker-compose.dev.yml up -d
```

Wait for health:

```bash
curl http://localhost:2785/api/health
curl http://localhost:2785/api/health/ready
```

Open:

```text
Dashboard: http://localhost:2785
Swagger:   http://localhost:2785/api/docs
```

Read the generated local admin key:

```bash
cat data/.api-key
```

Windows PowerShell:

```powershell
Get-Content .\data\.api-key
```

Never commit this key.

## Create and connect the owner session

Set shell variables using real values:

```bash
export OPENWA_API_KEY="owa_k1_REPLACE_ME"
```

Create a session:

```bash
curl -X POST http://localhost:2785/api/sessions \
  -H "X-API-Key: $OPENWA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"mybloom-owner-local"}'
```

Copy the returned generated `id`, not only the session name:

```bash
export OPENWA_SESSION_ID="REPLACE_WITH_RETURNED_SESSION_ID"
```

Start it:

```bash
curl -X POST \
  "http://localhost:2785/api/sessions/$OPENWA_SESSION_ID/start" \
  -H "X-API-Key: $OPENWA_API_KEY"
```

Open the dashboard and scan the QR with WhatsApp:

```text
WhatsApp -> Settings -> Linked devices -> Link a device
```

Poll until ready:

```bash
curl \
  "http://localhost:2785/api/sessions/$OPENWA_SESSION_ID" \
  -H "X-API-Key: $OPENWA_API_KEY"
```

Acceptance condition:

```text
status = ready
phone  = 212639760141
```

# Phase 3 — Configure Laravel

Add server-only values to Laravel `.env`:

```env
OPENWA_BASE_URL=http://127.0.0.1:2785/api
OPENWA_API_KEY=owa_k1_REPLACE_ME
OPENWA_SESSION_ID=REPLACE_WITH_GENERATED_SESSION_ID
OPENWA_OWNER_PHONE=212639760141
OPENWA_WEBHOOK_SECRET=replace-with-a-long-random-secret
OPENWA_AUTO_SEND_ENABLED=true
OPENWA_DELIVERY_WAIT_SECONDS=90
```

Do not use a `NEXT_PUBLIC_` prefix for any secret.

Add to `config/services.php`:

```php
'openwa' => [
    'base_url' => env('OPENWA_BASE_URL', 'http://127.0.0.1:2785/api'),
    'api_key' => env('OPENWA_API_KEY'),
    'session_id' => env('OPENWA_SESSION_ID'),
    'owner_phone' => env('OPENWA_OWNER_PHONE', '212639760141'),
    'webhook_secret' => env('OPENWA_WEBHOOK_SECRET'),
    'auto_send_enabled' => env('OPENWA_AUTO_SEND_ENABLED', true),
    'delivery_wait_seconds' => env('OPENWA_DELIVERY_WAIT_SECONDS', 90),
],
```

Run:

```bash
php artisan config:clear
```

# Phase 4 — Normalize Moroccan customer numbers

Create one server-side normalizer. Do not depend on the browser's formatting.

Accepted examples:

```text
0720356971
07 20 35 69 71
+212 720-356971
00212720356971
212720356971
720356971
```

All become:

```text
212720356971
```

Create `app/Support/MoroccanPhone.php`:

```php
<?php

declare(strict_types=1);

namespace App\Support;

use InvalidArgumentException;

final class MoroccanPhone
{
    public static function normalize(string $input): string
    {
        $digits = preg_replace('/\D+/', '', trim($input)) ?? '';

        if (str_starts_with($digits, '00212')) {
            $digits = substr($digits, 2);
        }

        if (strlen($digits) === 10 && str_starts_with($digits, '0')) {
            $digits = '212' . substr($digits, 1);
        } elseif (strlen($digits) === 9 && !str_starts_with($digits, '212')) {
            $digits = '212' . $digits;
        }

        if (!preg_match('/^212[0-9]{9}$/', $digits)) {
            throw new InvalidArgumentException('Invalid Moroccan phone number.');
        }

        return $digits;
    }
}
```

Do not require the number to exist in the admin's phone contacts.

# Phase 5 — Create a correct OpenWA client

Create `app/Services/OpenWaClient.php`:

```php
<?php

declare(strict_types=1);

namespace App\Services;

use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

final class OpenWaClient
{
    private function http(): PendingRequest
    {
        return Http::acceptJson()
            ->asJson()
            ->withHeaders([
                'X-API-Key' => (string) config('services.openwa.api_key'),
            ])
            ->connectTimeout(3)
            ->timeout(20)
            ->retry(2, 500, throw: false);
    }

    private function url(string $path): string
    {
        return rtrim((string) config('services.openwa.base_url'), '/')
            . '/' . ltrim($path, '/');
    }

    private function sessionId(): string
    {
        $id = (string) config('services.openwa.session_id');

        if ($id === '') {
            throw new RuntimeException('OPENWA_SESSION_ID is missing.');
        }

        return rawurlencode($id);
    }

    public function session(): array
    {
        return $this->http()
            ->get($this->url("sessions/{$this->sessionId()}"))
            ->throw()
            ->json();
    }

    public function assertOwnerSessionReady(): void
    {
        $session = $this->session();
        $expected = (string) config('services.openwa.owner_phone');

        if (($session['status'] ?? null) !== 'ready') {
            throw new RuntimeException('OpenWA session is not ready.');
        }

        if ((string) ($session['phone'] ?? '') !== $expected) {
            throw new RuntimeException('Wrong WhatsApp account linked to OpenWA.');
        }
    }

    public function checkNumber(string $digits): array
    {
        return $this->http()
            ->get($this->url(
                "sessions/{$this->sessionId()}/contacts/check/"
                . rawurlencode($digits)
            ))
            ->throw()
            ->json();
    }

    public function sendText(string $chatId, string $text): array
    {
        return $this->http()
            ->post($this->url(
                "sessions/{$this->sessionId()}/messages/send-text"
            ), [
                'chatId' => $chatId,
                'text' => $text,
            ])
            ->throw()
            ->json();
    }
}
```

Rules:

- Call `contacts/check/{number}` using digits only.
- Require `exists === true`.
- Use the returned `whatsappId` as the recipient; do not always reconstruct `@c.us` manually.
- A valid `whatsappId` can differ because of WhatsApp identity mapping.
- Treat the returned `messageId` as accepted, not delivered.

# Phase 6 — Generate a secure invoice link

Prefer a temporary signed route instead of exposing a public predictable invoice path.

Example route:

```php
Route::get('/invoices/{order}/download', DownloadInvoiceController::class)
    ->name('invoices.download')
    ->middleware('signed');
```

Generate after the order is saved:

```php
$invoiceUrl = URL::temporarySignedRoute(
    'invoices.download',
    now()->addDays(7),
    ['order' => $order->getRouteKey()]
);
```

For a phone to open a locally generated invoice URL:

1. Run Laravel on the LAN interface:

```bash
php artisan serve --host=0.0.0.0 --port=8000
```

2. Set `APP_URL` to the computer's LAN IP, not `localhost`, for example:

```env
APP_URL=http://192.168.1.20:8000
```

3. Keep the phone and computer on the same Wi-Fi.

A URL containing `127.0.0.1` or `localhost` points to the customer's phone itself and will not open your computer's invoice.

# Phase 7 — Create the order confirmation job

Dispatch only after the order transaction commits:

```php
SendOpenWaOrderConfirmation::dispatch($order->id)->afterCommit();
```

The job must:

1. Load the order and all item/product snapshots.
2. Stop when already delivered/read.
3. Confirm the session is ready and linked to `212639760141`.
4. Normalize the checkout phone.
5. Call `contacts/check`.
6. Stop with `number_not_on_whatsapp` when `exists` is false.
7. Read and use `whatsappId`.
8. Build the message only from saved server-side order data.
9. Generate the secure invoice link.
10. Call `send-text` once.
11. Save `messageId` and status `accepted`.
12. Never roll back or delete the order when WhatsApp fails.

Message structure:

```text
Bonjour {customer_name} 👋

✅ Votre commande MyBloom est confirmée.
Commande : #{reference}

Produits :
• {product_name} × {quantity} — {line_total} MAD

Sous-total : {subtotal} MAD
Livraison : {delivery_fee} MAD
Total : {grand_total} MAD
Paiement : {payment_method}

Télécharger votre facture :
{signed_invoice_url}

Merci pour votre confiance 🌸
MyBloom
```

Escape or constrain user-controlled values. WhatsApp text has a 4096-character limit; truncate excessive product lists safely and keep the invoice link.

# Phase 8 — Add delivery-state columns

Add fields equivalent to:

```text
whatsapp_phone_normalized
whatsapp_recipient_id
whatsapp_message_id
whatsapp_status
whatsapp_attempted_at
whatsapp_sent_at
whatsapp_delivered_at
whatsapp_read_at
whatsapp_failed_at
whatsapp_failure_reason
whatsapp_customer_initiated_at
whatsapp_confirmation_token_hash
whatsapp_confirmation_token_expires_at
```

Suggested status values:

```text
queued
invalid_phone
number_not_on_whatsapp
accepted
sent
delivered
read
failed
unconfirmed
customer_action_required
```

Add a unique index for `whatsapp_message_id` when compatible with the database.

# Phase 9 — Register and verify OpenWA webhooks locally

Subscribe to:

```text
message.ack
message.failed
message.received
session.disconnected
```

When OpenWA runs in Docker and Laravel runs on the Windows/macOS host, use:

```text
http://host.docker.internal:8000/api/openwa/webhook
```

On Linux Docker Engine, add this to the OpenWA compose service if needed:

```yaml
extra_hosts:
  - "host.docker.internal:host-gateway"
```

Register:

```bash
curl -X POST \
  "http://localhost:2785/api/sessions/$OPENWA_SESSION_ID/webhooks" \
  -H "X-API-Key: $OPENWA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "url":"http://host.docker.internal:8000/api/openwa/webhook",
    "events":["message.ack","message.failed","message.received","session.disconnected"],
    "secret":"REPLACE_WITH_THE_SAME_LARAVEL_SECRET"
  }'
```

OpenWA signs the exact raw request body in:

```text
X-OpenWA-Signature: sha256=<hex-hmac>
```

Laravel verification must use `$request->getContent()` without re-encoding JSON:

```php
$raw = $request->getContent();
$received = (string) $request->header('X-OpenWA-Signature');
$expected = 'sha256=' . hash_hmac(
    'sha256',
    $raw,
    (string) config('services.openwa.webhook_secret')
);

abort_unless(hash_equals($expected, $received), 401);
```

Use the installed Swagger and a captured local webhook payload to confirm the exact event envelope before finalizing field extraction.

For `message.ack`, map the normalized status:

```text
pending -> accepted/queued
sent -> sent
delivered -> delivered
read -> read
failed -> failed
```

Only `delivered` or `read` proves device delivery.

Return HTTP 200 quickly. Queue slow processing.

# Phase 10 — Free OpenWA-only fallback for brand-new numbers

Because a cold first message may be silently dropped, create a customer-initiated fallback.

After checkout, generate a random one-time token, store only its hash, and show a button:

```text
Recevoir ma facture sur WhatsApp
```

The link opens the owner number:

```text
https://wa.me/212639760141?text=CONFIRM%20{order_reference}%20{one_time_token}
```

The customer must tap Send. Then:

1. OpenWA receives `message.received`.
2. Verify the HMAC webhook signature.
3. Ignore group messages and messages from the owner account.
4. Parse the exact `CONFIRM reference token` format.
5. Hash and compare the token in constant time.
6. Check token expiry and single-use state.
7. Confirm the sender phone matches the order phone when resolvable.
8. Mark `whatsapp_customer_initiated_at`.
9. Reply through OpenWA with the order details and invoice link.
10. Invalidate the token after successful reply.

Do not rely only on the order number; it is guessable and could expose another customer's invoice.

This fallback remains free and OpenWA-only. It is more reliable because the customer creates the conversation first, but it is not fully automatic because the customer must tap Send.

# Phase 11 — Retry and idempotency policy

Allowed automatic retries:

- Connection timeout.
- HTTP 429 using exponential backoff.
- HTTP 5xx.
- Temporarily disconnected session after it becomes ready again.

Do not repeatedly resend when:

- The number is not registered on WhatsApp.
- HTTP 201 was returned but no delivery acknowledgement followed.
- The customer did not consent.
- The customer requested no more messages.

Use a stable idempotency condition such as:

```text
one active customer confirmation per order + channel
```

Do not send from the checkout HTTP request if it makes the customer wait. Use a queue job.

# Phase 12 — Local end-to-end test plan

Run these processes:

```text
Terminal 1: OpenWA Docker stack
Terminal 2: Laravel server on 0.0.0.0:8000
Terminal 3: Laravel queue worker
Terminal 4: Next.js frontend, when separate
```

Commands typically include:

```bash
docker compose -f docker-compose.dev.yml up -d
php artisan serve --host=0.0.0.0 --port=8000
php artisan queue:work --tries=3 --timeout=60
npm run dev
```

Test cases:

1. Session health and owner identity.
2. Moroccan number normalization, including `+212 720-356971`.
3. Invalid number rejected without failing the order.
4. Valid number not registered on WhatsApp.
5. Existing chat receives confirmation and invoice link.
6. Brand-new number automatic attempt returns a messageId.
7. ACK changes order from accepted to delivered/read when received.
8. A 201 response without delivered ACK remains unconfirmed.
9. Customer-initiated `wa.me` fallback triggers an automatic reply.
10. Invalid, expired, reused, or mismatched confirmation token is rejected.
11. Duplicate checkout/callback does not send duplicate messages.
12. OpenWA offline does not roll back the order.
13. Invoice URL opens from the test phone on the same LAN.
14. Webhook with invalid HMAC returns 401.
15. Webhook endpoint returns quickly and does not time out.

# Diagnostic checklist

When a customer receives nothing, record:

```text
order id/reference
raw checkout phone
normalized digits
OpenWA version
engine type
session id
session status
session phone
contacts/check response
canonical whatsappId
send-text HTTP status
send-text response body
messageId
message.ack events
final status
invoice URL host
Laravel logs
OpenWA container logs
```

Useful commands:

```bash
curl http://localhost:2785/api/health
docker compose ps
docker compose logs openwa --tail=200
php artisan queue:failed
php artisan queue:retry all
```

Classify accurately:

| Evidence | Meaning |
|---|---|
| `401` | Invalid or missing API key |
| `400` | Invalid payload/JID or session not ready |
| `409` | Session lifecycle conflict/not connected |
| `429` | Rate limited |
| `contacts/check.exists=false` | Number is not on WhatsApp |
| `201` + no ACK | Gateway accepted; delivery unconfirmed |
| ACK `sent` only | Reached WhatsApp servers, not proven on device |
| ACK `delivered` | Delivered to customer device |
| Existing chat works; cold number does not | WhatsApp first-contact policy is likely |
| Invoice text arrives; URL fails | APP_URL/network/signed-route issue |

# Definition of done

Do not declare the task complete until all applicable conditions pass:

- The linked sender session phone is exactly `212639760141`.
- Customer destination comes dynamically from the saved checkout order.
- No application contact-list or previous-chat gate remains.
- The number is normalized and verified through `contacts/check`.
- The canonical returned `whatsappId` is used.
- Order details come from saved backend data, not frontend totals.
- The invoice link is signed and opens from the test phone.
- Sending happens after commit through a queue.
- HTTP 201 is stored as accepted, not delivered.
- HMAC-verified ACK webhooks update real delivery state.
- Duplicate sends are prevented.
- OpenWA failure never deletes or invalidates the order.
- The customer-initiated fallback works for a fresh number.
- Logs contain no API key, auth state, invoice token, or private invoice content.
- The final report clearly separates automatic best-effort delivery from confirmed delivery.

# Prohibited shortcuts

Never:

- Save every customer manually as a contact.
- Require a previous chat in application logic.
- Invent a fake chat object before sending.
- Mark 201 as delivered.
- Loop retries until WhatsApp accepts a cold message.
- Expose the API key in Next.js/browser code.
- Hardcode customer numbers.
- Use `localhost` in a link expected to open on the customer's phone.
- Delete an order because OpenWA is unavailable.
- Claim guaranteed first-contact delivery through OpenWA.
- Replace this gateway with the unrelated `@open-wa/wa-automate` API.

# Official references

Verify the installed version and exact payloads against:

```text
https://docs.open-wa.org/
https://docs.open-wa.org/getting-started/quick-start/
https://docs.open-wa.org/getting-started/first-session/
https://docs.open-wa.org/guides/safe-sending/
https://docs.open-wa.org/reference/troubleshooting/
https://docs.open-wa.org/reference/glossary/
https://github.com/rmyndharis/OpenWA
https://github.com/rmyndharis/OpenWA/blob/main/openapi.json
```
