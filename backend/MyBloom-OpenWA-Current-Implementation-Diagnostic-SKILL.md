---
name: mybloom-openwa-current-implementation-diagnostic
description: >
  Read-only forensic diagnostic skill for the local MyBloom e-commerce project.
  Inspect the existing Docker/Docker Compose and OpenWA integration, trace the
  checkout-to-WhatsApp order-confirmation flow, and explain with evidence why
  the current environment can send order information to customer numbers that
  are not saved as contacts and have no previous chat. Do not modify the
  existing implementation.
---

# MyBloom OpenWA Current Implementation Diagnostic

## Mission

Perform a deep, evidence-based diagnostic of the CURRENT LOCAL MyBloom implementation.

The current environment is reported to use Docker/OpenWA and to successfully
send order-confirmation messages and order information to customer WhatsApp
numbers even when:

- the customer number is not saved in the sender/admin contact list;
- there is no previous WhatsApp chat with that customer;
- the customer has never contacted the sender/admin before.

The purpose of this skill is NOT to redesign the workflow and NOT to replace it.
The purpose is to inspect the actual running implementation and explain exactly
how it works, which OpenWA project/version/engine it uses, how it resolves new
recipient numbers, which API path is called, which Docker components are
involved, and what evidence proves successful delivery.

## Non-negotiable rules

1. Start READ-ONLY.
2. Do not change application source code.
3. Do not change Dockerfile, docker-compose files, environment variables,
   volumes, session state, database records, routes, queues, webhooks, or
   WhatsApp configuration.
4. Do not restart, rebuild, recreate, remove, or prune containers during the
   diagnostic phase.
5. Never run destructive Docker commands such as `docker compose down --volumes`,
   `docker volume rm`, or `docker system prune`.
6. Never delete OpenWA session/auth data.
7. Never expose API keys, tokens, cookies, QR data, session credentials,
   database passwords, or webhook secrets in the final report.
8. Redact secrets as `<REDACTED>`.
9. Do not assume that the project uses a specific OpenWA package only because
   its name contains "OpenWA". Fingerprint the actual implementation.
10. Do not claim that an API `2xx` response proves delivery. Look for delivery
    acknowledgement evidence when available.
11. Do not send diagnostic WhatsApp messages to arbitrary people. If an
    end-to-end test is necessary, use only a test number explicitly authorized
    by the project owner.
12. Do not modify the existing customer order workflow to make the diagnostic easier.
13. Separate FACT, INFERENCE, and UNKNOWN in the report.
14. If evidence is missing, say "not proven" instead of guessing.

## OpenWA baseline to compare against

Use the runtime itself as the primary source of truth.

For the `rmyndharis/OpenWA` gateway, the public architecture currently includes:

- REST API under `/api`;
- default host port `2785`;
- API-key authentication;
- one WhatsApp connection per session;
- `whatsapp-web.js` or `baileys` engines;
- individual recipient JIDs commonly represented as `<number>@c.us`;
- number existence checks through
  `GET /api/sessions/{sessionId}/contacts/check/{number}`;
- text sending through
  `POST /api/sessions/{sessionId}/messages/send-text`;
- acknowledgement/event support including `message.ack`.

Do NOT force these assumptions onto the current project. First prove which
OpenWA implementation and version are actually running.

## Known platform nuance

OpenWA documents that a first message to a brand-new contact can sometimes be
silently dropped by WhatsApp server-side policy even when the gateway reports
that the send request succeeded.

Therefore, if this MyBloom environment is demonstrably delivering messages to
new customer numbers, that does not contradict the documented behavior.
"Sometimes dropped" is not the same as "always blocked".

The diagnostic must determine what THIS environment actually does and why it
has been working, without turning that observation into an unsupported
guarantee for every number/account/network.

# Phase 0 — Protect the current environment

Before inspection:

```bash
git status --short
git branch --show-current
git rev-parse --short HEAD
```

Do not stash, reset, checkout, commit, clean, restart or rebuild anything.

Create the final report only after inspection:

```text
CURRENT_OPENWA_IMPLEMENTATION_DIAGNOSTIC.md
```

# Phase 1 — Inventory the local project

Locate the infrastructure and integration files.

```bash
find . -maxdepth 4 \
  \( -iname 'Dockerfile*' \
  -o -iname 'docker-compose*.yml' \
  -o -iname 'docker-compose*.yaml' \
  -o -iname 'compose.yml' \
  -o -iname 'compose.yaml' \
  -o -iname '.env.example' \
  -o -iname 'package.json' \
  -o -iname 'composer.json' \
  -o -iname 'artisan' \
  -o -iname '*whatsapp*' \
  -o -iname '*openwa*' \
  -o -iname '*order*' \
  -o -iname '*invoice*' \) -print
```

Identify and confirm:

- frontend technology;
- backend technology;
- order model/entity;
- checkout controller/action;
- order service;
- queue/job system;
- invoice generation;
- WhatsApp/OpenWA service/client;
- Dockerfile(s);
- Docker Compose file(s);
- environment configuration;
- webhook routes/controllers;
- notification status fields;
- logs.

# Phase 2 — Fingerprint the exact OpenWA implementation

Search:

```bash
rg -n --hidden \
  -g '!node_modules' -g '!vendor' -g '!.git' \
  -e 'rmyndharis/OpenWA' \
  -e '@open-wa/wa-automate' \
  -e 'OpenWA' \
  -e 'send-text' \
  -e '/sendText' \
  -e 'contacts/check' \
  -e 'X-API-Key' \
  -e 'ENGINE_TYPE' \
  -e 'whatsapp-web.js' \
  -e 'baileys' .
```

Inspect:

- Dockerfile `FROM` lines;
- Git clone URL if any;
- image names/tags;
- package dependencies;
- lockfiles;
- startup commands;
- copied OpenWA source;
- compose service names;
- exposed ports;
- environment variable names.

The report MUST answer:

- Which OpenWA project is actually running?
- Which exact version/commit/tag is running?
- Is it built from a local Dockerfile or pulled as an image?
- Which engine is configured?
- Where is its session state persisted?

# Phase 3 — Inspect Docker configuration without changing it

Read every relevant Dockerfile and Compose file.

Render effective Compose config:

```bash
docker compose config
```

Redact secret VALUES before reporting.

Inspect running containers:

```bash
docker compose ps
docker ps --format 'table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}'
```

Use `docker inspect <container>` only on relevant containers.

Determine the ACTUAL network path, for example:

```text
Laravel host -> http://127.0.0.1:2785
Laravel container -> http://openwa-api:2785
```

Do not assume either one.

Record:

- service names;
- build contexts;
- Dockerfile paths;
- images/tags;
- host/container ports;
- networks;
- volumes;
- health checks;
- restart policy;
- dependencies;
- OpenWA data/session persistence.

# Phase 4 — Verify OpenWA runtime health and identity

Use non-destructive reads.

Baseline:

```bash
curl -sS http://localhost:2785/api/health
```

Use the actual mapped port if different.

With the existing API key, without printing it:

```bash
curl -sS -H "X-API-Key: <REDACTED>" \
  http://localhost:2785/api/sessions
```

Then inspect the active session:

```bash
curl -sS -H "X-API-Key: <REDACTED>" \
  http://localhost:2785/api/sessions/<SESSION_ID>
```

Record only safe facts:

- session id/name;
- status;
- engine;
- sender identity if exposed safely;
- runtime version/commit if available.

If runtime API does not expose version, inspect container/package metadata
read-only.

# Phase 5 — Trace the complete checkout-to-WhatsApp flow

Search:

```bash
rg -n --hidden \
  -g '!node_modules' -g '!vendor' -g '!.git' \
  -e 'Order::create' \
  -e 'createOrder' \
  -e 'checkout' \
  -e 'dispatch' \
  -e 'ShouldQueue' \
  -e 'invoice' \
  -e 'facture' \
  -e 'sendText' \
  -e 'send-text' \
  -e 'chatId' \
  -e 'whatsappId' \
  -e '@c.us' \
  -e '@lid' \
  -e 'contacts/check' \
  -e 'messageId' \
  -e 'message.ack' \
  -e 'delivered' \
  -e 'read' .
```

Trace:

```text
checkout request
 -> validation
 -> order persistence
 -> order items persistence
 -> invoice creation/link
 -> notification trigger
 -> queue/job/event/listener
 -> recipient normalization
 -> OpenWA transport
 -> OpenWA endpoint
 -> response handling
 -> delivery acknowledgement handling
```

For every step, record:

- file path;
- class/function/method;
- input;
- output;
- sync/queue/event behavior;
- error handling;
- retry behavior.

# Phase 6 — Prove where the customer recipient comes from

Find the exact checkout phone field.

Prove:

1. Request field containing customer phone.
2. Backend validation.
3. Database order field.
4. Number normalization.
5. Whether JID is built directly.
6. Whether `contacts/check` is called.
7. Whether returned `whatsappId` is used.
8. Whether code queries the admin's saved contacts.
9. Whether code requires an existing chat.
10. Whether any database allow-list exists.
11. Whether another provider is actually sending.

If there is no saved-contact/chat requirement in the code, report that only
after proving it.

# Phase 7 — Inspect Moroccan number normalization

Test the normalizer WITHOUT sending:

```text
+212 720-356971
0720356971
212720356971
+212611955060
```

For `+212 720-356971`, record the actual current-code result.

Expected normalized digits in a standard Morocco normalization are:

```text
212720356971
```

But the report must show what the CURRENT implementation actually produces.

Check for:

- wrong leading-zero removal;
- duplicate `212`;
- rejecting `07` numbers;
- spaces/hyphens left in value;
- `@c.us` appended twice;
- accidental `@lid` misuse.

# Phase 8 — Determine exact sending strategy

Identify the ACTUAL request made by current code.

For each send, document:

- HTTP method;
- route;
- non-secret header names;
- request JSON field names;
- recipient value source;
- timeout;
- retry;
- returned HTTP status;
- returned message-id shape.

Classify the current strategy:

A. Directly send to generated JID.
B. Check number then send to returned `whatsappId`.
C. Resolve existing chat first.
D. Save/import contact first.
E. Different OpenWA endpoint.
F. Different provider/transport.

This is a central finding.

# Phase 9 — Distinguish WhatsApp existence from saved contacts

If the app uses the OpenWA number check, inspect it:

```bash
curl -sS -H "X-API-Key: <REDACTED>" \
  "http://localhost:2785/api/sessions/<SESSION_ID>/contacts/check/212720356971"
```

Important distinction:

```text
number exists on WhatsApp
!= number saved in sender phonebook
!= previous chat exists
!= message delivered
```

The report must show whether the current code understands these as different
states.

# Phase 10 — Prove actual delivery, not only API acceptance

Search application and OpenWA integration for:

```bash
rg -n --hidden \
  -g '!node_modules' -g '!vendor' -g '!.git' \
  -e 'message.ack' \
  -e 'whatsapp_status' \
  -e 'whatsapp_message_id' \
  -e 'delivered' \
  -e 'read' \
  -e 'failed' .
```

Determine whether the app distinguishes:

```text
HTTP accepted
message id returned
sent to WhatsApp
delivered to customer device
read
failed/unconfirmed
```

If ACK tracking does not exist, say so.

# Phase 11 — Inspect Docker logs around a known successful order

Use a narrow historical window if available:

```bash
docker compose logs --since "30m" <openwa-service>
docker compose logs --since "30m" <backend-service>
```

Or use the known order timestamp.

Look for:

- order reference;
- normalized recipient;
- OpenWA session;
- send request;
- returned message id;
- ACK transition;
- errors/retries.

Mask customer personal data in the report.

# Phase 12 — Diagnose why brand-new numbers currently work

Evaluate hypotheses ONLY after collecting evidence.

## H1 — No application-level saved-contact prerequisite

Possible proof:

- customer phone comes directly from order;
- no contact-list query;
- no chat-history prerequisite;
- send uses a dynamic JID/canonical WhatsApp ID.

## H2 — OpenWA verifies WhatsApp registration, not phonebook membership

Possible proof:

- `contacts/check`;
- `exists: true`;
- returned `whatsappId`.

## H3 — Current engine/account accepts the first-contact send

Possible proof:

- active engine;
- successful historical or authorized test send;
- delivery ACK/device receipt.

Do not convert this into a universal guarantee.

## H4 — Sender trust/history and transactional workload may contribute

Possible observations:

- established sender;
- normal account use;
- low send rate;
- real customers placing orders.

This is INFERENCE unless directly proven.

## H5 — Network/runtime characteristics may contribute

Inspect:

- engine type;
- proxy config;
- rate limits;
- local vs data-center hosting if known.

Do not infer IP reputation.

## H6 — Another provider/fallback is actually sending

Search for Meta Cloud API, Twilio, Evolution API, `@open-wa/wa-automate`, or
other messaging providers.

## H7 — "Success" means only API acceptance

Check whether device delivery or ACK is actually proven.

# Phase 13 — Controlled end-to-end verification

Only if an authorized test number is explicitly provided.

Do not add it to contacts.
Do not create a previous chat manually.

Test one normal checkout only:

1. Place local test order.
2. Confirm order stored.
3. Confirm notification trigger.
4. Confirm normalized recipient.
5. Confirm exact OpenWA recipient id.
6. Confirm OpenWA response/message id.
7. Confirm actual device receipt.
8. Confirm `delivered`/`read` ACK if implemented.
9. Do not repeatedly resend on failure.

# Phase 14 — Docker persistence diagnostic

Because this environment uses Docker, inspect:

- bind mounts;
- named volumes;
- session/auth data location;
- DB persistence;
- restart policy.

Explain how the linked WhatsApp session remains authenticated if persistence is
correct.

Never remove or recreate the volume.

# Phase 15 — Produce the architecture map

Use actual project names, for example:

```text
Browser checkout
   |
   v
<actual controller/action>
   |
   +--> orders / order_items
   |
   +--> <invoice component>
   |
   +--> <actual queue/job/listener>
             |
             v
       <phone normalizer>
             |
             v
       <OpenWA client/service>
             |
             v
       Docker network / localhost
             |
             v
       OpenWA REST API
             |
             v
       Active WhatsApp session
             |
             v
       WhatsApp
             |
             v
       Customer device
```

# Required output

Create:

```text
CURRENT_OPENWA_IMPLEMENTATION_DIAGNOSTIC.md
```

with the following structure.

## 1. Executive conclusion
- Does it really send to unsaved/no-history numbers?
- What evidence proves it?
- Is the contact list involved?
- What is the actual mechanism?

## 2. Scope and non-modification statement
- State that the diagnostic was read-only.
- List any controlled test performed.

## 3. Environment fingerprint
Include OS, Git commit, Docker/Compose, relevant containers, OpenWA
implementation/version, engine, port, session status, DB/storage.

## 4. Docker architecture
Explain Dockerfile, Compose, build/image, network path, volumes and session
persistence.

## 5. Exact checkout-to-WhatsApp call graph

Use:

| Step | File | Function/Class | Input | Output |
|---|---|---|---|---|

## 6. Customer phone flow

```text
checkout field
 -> validation
 -> database
 -> normalization
 -> OpenWA lookup/JID
 -> send request
```

## 7. Contact/history requirement verdict

```text
Saved contact required by application: YES / NO / NOT PROVEN
Previous chat required by application: YES / NO / NOT PROVEN
WhatsApp existence check: YES / NO / NOT PROVEN
```

Include code evidence.

## 8. OpenWA request actually used
Document method, route, header names, request fields, timeout/retry and response
shape. Never include secret values.

## 9. Why a new number currently works

| Finding | Evidence | Classification |
|---|---|---|
| ... | ... | FACT / INFERENCE / UNKNOWN |

## 10. Delivery proof

| Level | Proven? | Evidence |
|---|---:|---|
| API accepted | | |
| Message ID returned | | |
| Sent | | |
| Delivered | | |
| Read | | |

## 11. Docker/runtime evidence
Summarize relevant logs/runtime checks.

## 12. Known platform limitation
Explain that OpenWA documents occasional server-side silent drops on first
messages to brand-new contacts. A currently successful environment is observed
behavior, not a universal delivery guarantee.

## 13. Current implementation strengths
Only evidence-backed strengths.

## 14. Current implementation weaknesses/gaps
Only real gaps.

## 15. Final verdict
Choose:

### VERIFIED
Mechanism is fully traced and delivery to an authorized new number is proved.

### PARTIALLY VERIFIED
Code/runtime path is proved, but device delivery is not independently verified.

### NOT VERIFIED
Evidence is insufficient.

## 16. Recommended next action
Do not change behavior automatically.

If current implementation is correct, state:

> Preserve the current implementation. No behavioral rewrite is justified by
> this diagnostic.

# Final questions that MUST be answered

1. Which OpenWA project is installed?
2. Which exact version/commit is running?
3. Dockerfile build or prebuilt image?
4. Which Compose service runs OpenWA?
5. Active engine?
6. Sender session/number?
7. Checkout phone field?
8. How is `+212 720-356971` normalized?
9. Does app query sender saved contacts?
10. Does app require existing chat?
11. Does it call `contacts/check`?
12. Returned `whatsappId` or manual JID?
13. Exact send endpoint?
14. Non-secret request shape?
15. Text/document/invoice URL?
16. Is local invoice URL reachable from customer's device?
17. Sync/queue/event/listener?
18. Behavior when OpenWA is unavailable?
19. Can WhatsApp failure affect order persistence?
20. Duplicate prevention?
21. Message ID stored?
22. `message.ack` consumed?
23. `delivered` distinguished from `sent`?
24. Evidence a completely new authorized number received the message?
25. Exact explanation of successful current behavior?
26. Facts vs inferences vs unknowns clearly separated?

Do not finish until all 26 are answered or explicitly marked NOT PROVEN with
the missing evidence named.
