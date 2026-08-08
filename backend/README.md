# Parfum — Backend API

Laravel 11 · PHP 8.2+ · MySQL · tymon/jwt-auth

## Prerequisites

| Tool | Version |
|------|---------|
| PHP | ≥ 8.2 |
| Composer | ≥ 2.7 |
| MySQL | ≥ 8.0 |

## Quick start

```bash
# 1. Install PHP dependencies
composer install

# 2. Copy env file
cp .env.example .env

# 3. Generate app key
php artisan key:generate

# 4. Generate JWT secret
php artisan jwt:secret

# 5. Configure .env — update DB_* and FRONTEND_URL

# 6. Run migrations + seed
php artisan migrate --seed

# 7. Start development server
php artisan serve
```

API is available at `http://localhost:8000/api/v1`.

## WhatsApp order confirmations

Customer-facing confirmations use the self-hosted rmyndharis/OpenWA gateway. First-contact delivery is best effort: the application verifies acknowledgement and provides a customer-initiated fallback.

The checkout requires this explicit consent before an order can be created:

    J'accepte de recevoir sur WhatsApp la confirmation et les mises à jour de cette commande, ainsi que ma facture.

The backend normalizes Moroccan mobile numbers to E.164 digits, saves the order and one idempotent OpenWA delivery record in the same transaction, then queues the send after commit. OpenWA HTTP 201 is stored as `accepted`, never as delivered. Only an HMAC-verified `message.ack` with `delivered` or `read` can prove delivery. OpenWA errors never cancel the order.

### OpenWA configuration

Use only these server-side OpenWA values; do not expose them to Next.js:

    OPENWA_ENABLED=true
    OPENWA_BASE_URL=http://127.0.0.1:2785/api
    OPENWA_API_KEY=<secret>
    OPENWA_SESSION_ID=mybloom-owner
    OPENWA_OWNER_E164=212639760141
    OPENWA_ADMIN_RECIPIENT_E164=212611955060
    OPENWA_WEBHOOK_SECRET=<long-random-secret>
    OPENWA_WEBHOOK_URL=http://host.docker.internal:8000/api/v1/webhooks/openwa
    OPENWA_AUTO_ACK_TIMEOUT_SECONDS=120
    OPENWA_FALLBACK_TOKEN_TTL_HOURS=168

For a local phone test, set `OPENWA_INVOICE_PUBLIC_URL` and `APP_URL` to the computer's LAN address (for example `http://192.168.1.20:8000`), never `localhost`; the test phone and computer must use the same Wi-Fi.

Start the local gateway, link the owner account in its dashboard, then verify and register signed callbacks:

    php artisan openwa:verify-session
    php artisan openwa:configure-webhook

Run the worker after migrations:

    php artisan migrate --force
    php artisan config:clear
    php artisan queue:work database --queue=default --tries=1

OpenWA is the only WhatsApp provider in this workflow. It sends directly to the canonical WhatsApp ID returned by `contacts/check`; it never requires an admin contact or an existing chat. A new number can still have its first automatic message silently dropped by WhatsApp, so the checkout success page provides a one-time `wa.me` customer-initiated fallback. Do not configure or use the Meta WhatsApp API.

### Internal admin order alerts

Every committed order also creates one separate `admin_order_whatsapp_notifications` record and queues an internal OpenWA alert. It is independent from the customer confirmation, fallback, invoice, payment, and checkout paths: a failure only updates its own status record and log entry. The backend always resolves and sends to the fixed recipient `212611955060`; it never accepts a recipient from checkout data. HTTP acceptance is recorded with the OpenWA message ID, while signed `message.ack` events advance the status to `sent`, `delivered`, or `read`.

## Project structure

```
backend/
├── app/
│   ├── Http/
│   │   ├── Controllers/Api/V1/
│   │   │   ├── AuthController.php       # Register, login, logout, refresh, me
│   │   │   ├── UserController.php       # CRUD users (admin)
│   │   │   └── ProductController.php    # CRUD products
│   │   ├── Middleware/
│   │   │   ├── ForceJsonResponse.php    # Always return JSON
│   │   │   └── JwtAuthenticate.php      # JWT guard middleware
│   │   ├── Requests/                    # Form Request validation classes
│   │   └── Resources/
│   │       ├── UserResource.php         # Safe user serialisation
│   │       └── ProductResource.php      # Product serialisation
│   └── Models/
│       ├── User.php                     # JWTSubject, SoftDeletes
│       └── Product.php                  # Auto-slug, SoftDeletes
├── bootstrap/app.php                    # Laravel 11 app bootstrap
├── config/
│   ├── cors.php                         # CORS — restricted to FRONTEND_URL
│   └── jwt.php                          # JWT config
├── database/
│   ├── factories/UserFactory.php
│   ├── migrations/
│   └── seeders/
│       ├── DatabaseSeeder.php
│       ├── UserSeeder.php               # Admin + 10 customers
│       └── ProductSeeder.php            # 6 sample fragrances
└── routes/
    └── api.php                          # All versioned API routes
```

## API reference

### Auth

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/v1/auth/register` | — | Register new user |
| POST | `/api/v1/auth/login` | — | Login, returns JWT |
| POST | `/api/v1/auth/logout` | ✓ | Invalidates token |
| POST | `/api/v1/auth/refresh` | ✓ | Rotates token |
| GET  | `/api/v1/auth/me` | ✓ | Current user |

### Products

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/products` | — | List (paginated, filterable) |
| GET | `/api/v1/products/{id}` | — | Show single product |
| POST | `/api/v1/products` | ✓ Admin | Create product |
| PUT | `/api/v1/products/{id}` | ✓ Admin | Update product |
| DELETE | `/api/v1/products/{id}` | ✓ Admin | Delete product |

### Users

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/v1/users` | ✓ Admin | List all users |
| GET | `/api/v1/users/{id}` | ✓ Admin | Show user |
| PUT | `/api/v1/users/{id}` | ✓ | Update (self or admin) |
| DELETE | `/api/v1/users/{id}` | ✓ Admin | Delete user |

### Response format

All responses follow the `{ "data": ... }` wrapper from Laravel API Resources.  
Validation errors return:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "email": ["The email has already been taken."]
  }
}
```

## Default credentials (seeded)

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@parfum.test` | `Password1!` |
| Customer | *(factory generated)* | `password` |
