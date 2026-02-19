# Parfum — full-stack monorepo

> Two fully independent projects communicating **only** via REST API (JSON).

```
Parfum/
├── frontend/   ← Next.js 14 (App Router) · TypeScript · Tailwind
└── backend/    ← Laravel 11 · PHP 8.2 · MySQL · JWT
```

## Architecture

```
┌─────────────────────────┐          REST / HTTPS          ┌──────────────────────────┐
│       Frontend           │ ─────── JSON only ──────────▶ │        Backend API        │
│  Next.js (port 3000)    │ ◀─────────────────────────── │  Laravel (port 8000)      │
│                          │                                │                          │
│  • App Router (SSR/SSG) │                                │  • API-only (no Blade)   │
│  • JWT in cookie        │                                │  • Versioned /api/v1      │
│  • Axios service layer  │                                │  • JWT Auth               │
│  • No DB access         │                                │  • Form Request validation│
└─────────────────────────┘                                │  • API Resources          │
                                                           │  • CORS locked to FE URL  │
                                                           └──────────────────────────┘
```

## Getting started

### 1 — Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
# Edit .env → DB_*, FRONTEND_URL
php artisan migrate --seed
php artisan serve          # → http://localhost:8000
```

### 2 — Frontend

```bash
cd frontend
npm install
# .env.local already set for localhost — edit if needed
npm run dev                # → http://localhost:3000
```

## Security rules

| Rule | Details |
|------|---------|
| CORS | Backend allows **only** `FRONTEND_URL` |
| Auth | JWT stored in HttpOnly-capable cookie; rotated on refresh |
| Secrets | All secrets via `.env` — never committed |
| Rate limiting | 60 req/min (API) · 10 req/min (auth endpoints) |
| Validation | All input validated by Laravel Form Requests |
| Passwords | Bcrypt, min 8 chars, compromised-password check |
