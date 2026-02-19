# Parfum — Frontend

Next.js 14 (App Router) · TypeScript · Tailwind CSS · Axios

## Prerequisites

| Tool | Version |
|------|---------|
| Node.js | ≥ 20 LTS |
| npm / pnpm | any recent |

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Copy env file (already done — .env.local is committed for dev)
# Update NEXT_PUBLIC_API_URL if your backend runs on a different port

# 3. Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── layout.tsx          # Root layout (fonts, global CSS)
│   ├── page.tsx            # Landing page (SSG)
│   ├── login/page.tsx      # Login (Client Component)
│   ├── register/page.tsx   # Registration (Client Component)
│   └── dashboard/page.tsx  # Dashboard (SSR — requires auth)
├── components/             # Shared React components
│   ├── DashboardClient.tsx # Client-side dashboard shell
│   ├── LoadingSpinner.tsx  # Reusable spinner
│   └── Navbar.tsx          # Authenticated nav bar
├── lib/
│   └── auth.ts             # Token helpers (client + server)
├── services/
│   └── api.ts              # Axios instance + all API services
├── styles/
│   └── globals.css         # Tailwind base + component layer
├── types/
│   └── index.ts            # Shared TypeScript domain models
├── .env.local              # Dev environment variables
├── next.config.ts          # Next.js config
├── tailwind.config.ts      # Tailwind theme
└── tsconfig.json
```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | Laravel API base URL, e.g. `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_API_HOST` | API hostname for Next.js image optimisation |
| `NEXT_PUBLIC_APP_NAME` | App name shown in the browser tab |
| `NEXT_PUBLIC_TOKEN_COOKIE` | Cookie name that stores the JWT |

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start development server on port 3000 |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Auth flow

1. `POST /api/v1/auth/login` returns a JWT.
2. Token is stored in a browser cookie (`parfum_token`).
3. `services/api.ts` attaches `Authorization: Bearer <token>` on every request.
4. On 401, the interceptor hits `/auth/refresh` once then redirects to `/login`.
5. The dashboard `page.tsx` reads the cookie server-side and pre-fetches `/auth/me` via `serverFetch()`.
