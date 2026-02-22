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

## How the frontend home page is organized (what I added)

- **Sections (components):** The home page is assembled from isolated components imported in `app/page.tsx` in this order: `HeroSection`, `BrandLogos`, `BestSellers`, `CategoriesSection`, `UniversSection`, `ValentinesSection`, `CustomerReviewsSection`, then `Footer`.
- **`SectionContainer` (shared):** A new wrapper component at `components/SectionContainer.tsx` centralizes horizontal padding for sections (`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8`) so all sections align consistently.
- **`CategoriesSection` (Discover by Notes):** Converted from the reference HTML — includes the "Why Shop" row and the circular category grid. It now uses `SectionContainer` so its left/right padding matches other sections.
- **`UniversSection`:** Extracted from `code.html` and implemented as `components/UniversSection.tsx` (header + product grid), also wrapped by `SectionContainer`.
- **`ValentinesSection`:** Extracted and implemented as `components/ValentinesSection.tsx`. Uses the same markup and styling from the reference and is wrapped by `SectionContainer`.
- **`CustomerReviewsSection`:** Extracted the "Nos Clients, Notre Fierté" section into `components/CustomerReviewsSection.tsx` and wrapped with `SectionContainer`.
- **Brand logos:** `components/sections/BrandLogos.tsx` contains the brand row (includes BOSS, SAUVAGE, GUCCI, Balenciaga). It was made to scroll using the same marquee animation (`.scrolling-row`) while preserving the original spacing/gaps. On the page the brand row appears behind the hero background (moved into `HeroSection`) so it visually sits with the hero.
- **Announcement bar:** The top announcement uses `.scrolling-text` in the header — global CSS (`styles/globals.css`) adds the marquee animation and hover/reduced-motion accessibility support.

## Verify changes locally

1. Start the frontend dev server:

```bash
cd frontend
npm install
npm run dev
```

2. Open http://localhost:3000 and check the homepage: the sections listed above should appear in the order described. Pay special attention to:
- The left/right padding of sections (they should align). 
- Brand row: it should scroll horizontally and appear behind the hero.
- Announcement bar: should scroll and pause on hover (and not animate when `prefers-reduced-motion` is enabled).

If you want, I can run the dev server and iterate on any pixel-spacing tweaks you request.
