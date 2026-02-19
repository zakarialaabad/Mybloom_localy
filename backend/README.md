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
