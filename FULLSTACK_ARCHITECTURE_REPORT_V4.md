# FULLSTACK ARCHITECTURE REPORT — Bloom Parfums V4
**Date:** 2025  
**Stack:** Next.js 14 App Router (TypeScript) + Laravel 11 + MySQL  
**Region:** Morocco (MAD / DH currency, Moroccan shipping zones)  
**Auth Model:** Admin-only (Sanctum HttpOnly cookie `admin_token`) — no customer accounts  
**Maintained by:** Principal Full-Stack Engineering

---

## TABLE OF CONTENTS

1. [Frontend Analysis — All Pages & Components](#1-frontend-analysis)
2. [Dynamic Frontend Strategy — Data Wiring Plan](#2-dynamic-frontend-strategy)
3. [Backend Architecture](#3-backend-architecture)
4. [Database Design — 14 Tables](#4-database-design)
5. [API ↔ Frontend Mapping](#5-api--frontend-mapping)
6. [Execution Flow Diagrams](#6-execution-flow-diagrams)
7. [Seeder Reference Data](#7-seeder-reference-data)
8. [Validation Summary & Gap Analysis](#8-validation-summary--gap-analysis)

---

## 1. FRONTEND ANALYSIS

### Project Configuration

| Item | Value |
|---|---|
| Framework | Next.js 14, App Router |
| Language | TypeScript |
| Styling | Tailwind CSS with custom tokens (`aura-gold` #cda873, bg `#fdf8f1`, primary dark `#4a403a`) |
| Fonts | Playfair Display (serif headings), Inter (body) |
| HTTP Client | Axios via shared `apiClient` |
| State (Cart) | Zustand in-memory store (no DB persistence) |
| State (Wishlist) | `js-cookie` — cookie `bloom_wishlist`, 30-day expiry, max 50 IDs, client-only |
| State (Auth) | Sanctum HttpOnly cookie `admin_token` |
| Icons | Lucide React |
| Data Fetching | SWR (installed) |

---

### 1.1 `app/layout.tsx` — Root Layout

- **Type:** Server Component
- **Fonts:** `Playfair_Display` (subsets: latin, latin-ext) + `Inter` (weight 300–700)
- **Metadata:** `{ title: 'Bloom Parfums', description: '...' }`
- **Body classes:** `bg-[#fdf8f1] font-sans antialiased`
- **Status:** ✅ Complete and static — no API dependency

---

### 1.2 `app/page.tsx` — Home Page

- **Type:** Server Component
- **Sections assembled (in order):**

| # | Component | Data Status |
|---|---|---|
| 1 | `<Header />` | ⚠️ cart count hardcoded to 0 |
| 2 | `<HeroSection />` | ✅ Static marketing copy (acceptable) |
| 3 | `<BrandLogos />` | ❌ 9 hardcoded brand name strings |
| 4 | `<BestSellers />` | ❌ 5 hardcoded product objects |
| 5 | `<CategoriesSection />` | ❌ 6 hardcoded olfactory categories + static "Why Shop" section |
| 6 | `<UniversSection />` | ✅ Static editorial (gender browse links) |
| 7 | `<ValentinesSection />` | ✅ Static promotional banner |
| 8 | `<CustomerReviewsSection />` | ❌ Hardcoded 4.5 rating, 2689 count, 4 review cards |
| 9 | `<Footer />` | ✅ Static footer links |

**Required API calls for home page:**
- `GET /api/v1/brands` → hydrate `<BrandLogos />`
- `GET /api/v1/products?is_featured=true&limit=5` → hydrate `<BestSellers />`
- `GET /api/v1/categories` → hydrate `<CategoriesSection />`
- `GET /api/v1/reviews?approved=true&featured=true&limit=4` → hydrate `<CustomerReviewsSection />`

---

### 1.3 `app/collection/page.tsx` — Product Catalogue (284 lines)

- **Type:** `'use client'`
- **Layout:** Filter sidebar (left) + product grid (right) with sticky header

**Filter Sidebar — all currently hardcoded:**

| Filter Group | Data | Target API |
|---|---|---|
| Brand | 8 hardcoded brand names with checkboxes + search | `GET /api/v1/brands` |
| Price | Histogram bars (30 hardcoded widths via `useMemo`), range slider 0–5000 DH | computed from products |
| Gender | Hardcoded: Hommes / Femmes / Mixte | Static enum (OK) |
| Category | Hardcoded slugs: lavender, oud, oriental, floral, fresh, woody | `GET /api/v1/categories` |
| Notes/Rating | Hardcoded star options | Static UI (OK) |
| Promotions | Hardcoded: En Promo / Nouveau / Best-Seller | Static enum (OK) |

**Product Grid:**
- Grid/list view toggle (localStorage/state)
- Sort dropdown: Popular / Price Low-High / Price High-Low / Newest / Top Rated
- Product cards rendered via `<ProductCard />` with hardcoded array

**Required API call:** `GET /api/v1/products?brand[]=&category[]=&gender=&price_min=&price_max=&sort=&page=&limit=`

---

### 1.4 `app/product/[id]/page.tsx` — Product Detail (549 lines)

- **Type:** `'use client'`, route param: `{ id: string }` → **⚠️ SLUG MISMATCH** (backend uses `slug`, URL uses `id`)
- **Data:** Entire product object is a hardcoded mock inside the component

**UI Sections:**

| Section | Description | Status |
|---|---|---|
| Image Gallery | Main image + 4 thumbnails with active border | ❌ Hardcoded image array |
| Size Variants | 30ml / 50ml / 100ml cards with price and "ÉPUISÉ" stock badge | ❌ Hardcoded |
| Quantity Selector | +/− counter, max from selected size stock | ❌ Uses hardcoded stock |
| Action Buttons | Buy Now, Add to Cart (Zustand), Add to Wishlist (cookie) | ⚠️ Zustand/cookie wired, product data hardcoded |
| Description Accordion | Long-form product description | ❌ Hardcoded |
| Ingrédients Accordion | Circular ingredient images with name below | ❌ Hardcoded |
| Delivery & Returns | Static courier/return policy copy | ✅ Acceptable as static |
| Reviews Accordion | Aggregate star breakdown + review cards carousel | ❌ Hardcoded |
| FAQ Accordion | 5 hardcoded Q&A entries | ✅ Acceptable as static or CMS |

**Required API call:** `GET /api/v1/products/{slug}` → `ProductDetailResource` with:
- `images[]`, `sizes[]` (volume_ml, price, original_price, stock_quantity)
- `reviews[]` (approved, with rating, body, reviewer_name, images)
- `brand`, `category`, `ingredients` (needs JSON column or pivot)

**Fixup needed:** Route must change from `/product/[id]` → `/product/[slug]` to match backend routing.

---

### 1.5 `app/checkout/page.tsx` — Checkout (226 lines)

- **Type:** ⚠️ Server Component (`no 'use client'`) — **CRITICAL GAP**: Zustand cart cannot be read on the server; form state is unmanaged
- **Layout:** Shipping form (left) + order summary sidebar (right)

**Form Fields:**
- First name, last name, phone (MAR +212 prefix), city, quartier, code postal, adresse complète

**Shipping Methods (3 options — hardcoded):**

| Option | Label | Price |
|---|---|---|
| free | Livraison Gratuite | 0 DH (>590 DH orders) |
| region | Région — Casablanca/Rabat | 20 DH |
| national | National | 35 DH |

**Coupon UI:**
- Input field + "Appliquer" button
- Hardcoded validation state for code `"mybloomAz"` → `VOUS ÉCONOMISEZ 200 DH`
- Full price breakdown: subtotal / shipping / coupon discount / total

**Required changes:**
1. Convert to `'use client'` and wire Zustand cart via `useCartStore()`
2. Fetch `GET /api/v1/shipping-methods` for shipping options
3. Wire coupon: `POST /api/v1/coupons/validate { code, order_total }`
4. On submit: ` /api/v1/orders` with full payload → redirect to `/success?order=ORDER_NUMBER`

---
POST
### 1.6 `app/success/page.tsx` — Order Confirmation (116 lines)

- **Type:** Server Component
- **Currently:** Hardcoded order number `#LX-8921-Q`, hardcoded delivery address, total `795 DH`, phone `+212 6 78 56 23 12`
- **Shows:** Packaging image, order info table, customer phone in call-to-action box
- **Buttons:** "Continue Shopping" → `/collection`, "Track My Order" → `/track-order`

**Required change:** Must read `?order=ORDER_NUMBER` from URL `searchParams` and display real order data. Either:
- (a) Convert to `'use client'` + `useSearchParams()` + `GET /api/v1/orders/{orderNumber}/track?phone=`
- (b) Keep as Server Component and read `searchParams.order` — display limited info passed as URL params (order number, total, name, phone) without re-fetching sensitive data

---

### 1.7 `app/track-order/page.tsx` — Order Tracking Form (159 lines)

- **Type:** `'use client'` — ✅ **FULLY WIRED**
- **On submit:** `apiClient.get('/v1/orders/${orderNumber}/track', { params: { phone } })`
- **On success:** `router.push('/order-status?order=${orderNumber}&phone=${phone}')`
- **Error handling:** Shows error message below form on API failure
- **Status:** No changes needed

---

### 1.8 `app/order-status/page.tsx` — Order Timeline (196 lines)

- **Type:** Server Component
- **Currently:** Hardcoded order `#LX-8921-Q`, hardcoded 4-step delivery timeline, hardcoded item list

**Timeline Steps (currently static):**
1. Order Validated ✓
2. Dispatched par le vendeur ✓  
3. Shipped via Livreur ✓
4. Delivered — "Ait Melloul, Agadir" with timestamp

**Sidebar:** shipment contents (3 items with quantity badges), price breakdown (subtotal, shipping, total)

**Required change:** Convert to `'use client'`, read `?order=&phone=` from `useSearchParams()`, call `GET /api/v1/orders/{orderNumber}/track?phone=`, map `status_histories` array to the 4-step timeline.

---

### 1.9 `app/wishlist/page.tsx` — Wishlist Page

- **Type:** `'use client'`
- **Currently:** `Array(8).fill({ id: 1, name: '...', ... })` — 8 duplicated hardcoded items
- **Features:** Grid 2/3/5 columns toggle, filled Heart icon for remove, discount badge, Add to Bag button

**Required change:** On mount, call `getWishlist()` from `lib/wishlist.ts` (returns `number[]`) → `GET /api/v1/products?ids[]=${id1}&ids[]=${id2}...` to hydrate product details.

---

### 1.10 `app/feedback/page.tsx` — Post-Purchase Reviews (198 lines)

- **Type:** `'use client'`
- **Currently:** 2 hardcoded product review slots (name, description, image hardcoded)
- **Features:**
  - Per-product star rating row — click opens `<ReviewModal />`
  - `selectedProduct` state tracks which product is being reviewed
  - `CheckCircle2` icon marks already-rated products
  - `ReviewModal` props: `productName`, `productDesc`, `productImage`

**ReviewModal internals:**
- Star rating (hover + click) → `rating` state (0–5)
- Textarea for review body
- Image upload button (UI only — no file handling implemented yet)
- "Publish review >" button — **⚠️ NOT WIRED** (no `onClick` → no API call)

**Required changes:**
1. Read `?order=ORDER_NUMBER` from URL → `GET /api/v1/orders/{orderNumber}/track?phone=` for item list
2. Wire "Publish review" button: `POST /api/v1/reviews { product_id, order_id, rating, body, images[] }`

---

### 1.11 `app/admin/login/page.tsx` — Admin Login

- **Type:** `'use client'` — ✅ **FULLY WIRED**
- **On submit:** `adminAuthService.login({ email, password })` → sets `admin_token` cookie → `router.push('/admin/dashboard')`
- **Status:** No changes needed

---

### 1.12 Component Inventory

#### `components/layout/Header.tsx`
- **Type:** `'use client'`
- Cart count hardcoded: `const [cartCount] = useState(0)` — **⚠️ Must read from Zustand cart store**
- Search input (controlled, no API call yet) — needs `GET /api/v1/products?search=` with debounce
- `<CartDrawer />` and `<FilterModal />` integrated
- Nav links: MEN, WOMEN, BEAUTY, SALE, GIFT SETS, NEW ARRIVALS, BRANDS — all `href: '#'` (nonfunctional)

#### `components/CartDrawer.tsx`
- **Type:** `'use client'`
- Cart items **hardcoded** (3 items: Sugar Pop, Velvet Rose variants)
- Quantity +/− buttons present but not wired
- Trash icon buttons not wired
- Footer: price summary + "CHECKOUT" button → `/checkout`
- **Required:** Wire all actions to Zustand `useCartStore()` (add/remove/update quantity)

#### `components/ui/ProductCard.tsx`
- **Props interface:** `{ id, name, subtitle, description, price, originalPrice, rating, reviewCount, imageUrl, badge?, isBestSeller? }`
- Links to `/product/${id}` — **⚠️ Should link to `/product/${slug}` when slug is available**
- Wishlist toggle: local `useState(false)` — **⚠️ Not wired to `lib/wishlist.ts`**
- Rating stars rendered from `rating` prop
- Badge and isBestSeller labels rendered correctly

#### `components/ReviewModal.tsx`
- **Props:** `{ isOpen, onClose, productName, productDesc, productImage }`
- Star rating with hover state — UI complete
- Textarea for review body
- Image upload UI (no implementation)
- "Publish review ›" button — **⚠️ No `onClick` → no submit logic — must call `POST /api/v1/reviews`**

#### `components/sections/BestSellers.tsx`
- 5 hardcoded `ProductCardProps` objects (Midnight Bloom 50ml 198DH, Oceanic Drift 100ml 169DH, Velvet Rose 30ml 248DH, Silk Petals 50ml 178DH, Sugar Pop 50ml 140DH)
- **Required:** Accept `products: ProductCardProps[]` prop, fetch in parent via SWR

#### `components/sections/BrandLogos.tsx`
- 9 hardcoded brand name strings (Giorgio Armani, Chanel, Dior, Prada, Lancôme, Boss, Sauvage, Gucci, Balenciaga)
- **Required:** Fetch from `GET /api/v1/brands` — map `brand.name` to the scrolling strip

#### `components/CategoriesSection.tsx`
- **Type:** `'use client'`
- 6 hardcoded olfactory categories with slugs and Unsplash images
- Static "Why Shop with My Bloom" section (4 trust badges: Authentic, Pricing, Support, Returns) — ✅ Acceptable static
- **Required:** Fetch from `GET /api/v1/categories` for the category grid

#### `components/CustomerReviewsSection.tsx`
- **Type:** `'use client'`
- Hardcoded: aggregate 4.5, 2689 reviews, rating bar percentages (85/60/10/5/2%), 4 review cards
- **Required:** `GET /api/v1/reviews?approved=true&featured=true` for cards + server-side aggregate stats endpoint

#### `lib/wishlist.ts`
- ✅ Fully implemented: `getWishlist()`, `addToWishlist(id)`, `removeFromWishlist(id)`, `isInWishlist(id)`, `toggleWishlist(id)`, `clearWishlist()`
- Cookie: `bloom_wishlist`, 30-day expiry, max 50 items, `SameSite: Lax`, secure in production
- **Status:** Complete — just needs to be called from `ProductCard` wishlist toggle and `WishlistPage`

---

## 2. DYNAMIC FRONTEND STRATEGY

### 2.1 Fetch Strategy by Feature

| Feature | Fetch Strategy | Trigger | State Update |
|---|---|---|---|
| Home — BestSellers | SWR (CSR, stale-while-revalidate) | Component mount | Re-render with server data |
| Home — BrandLogos | SWR (CSR) | Component mount | Re-render |
| Home — CategoriesSection | SWR (CSR) | Component mount | Re-render |
| Home — CustomerReviewsSection | SWR (CSR) | Component mount | Re-render |
| Collection page products | SWR with URL filter params as key | Filter/sort change | Re-render grid |
| Collection page filters (brands/categories) | SWR (CSR, long TTL) | Sidebar mount | Populate filter options |
| Product detail | SWR keyed to `slug` | Route mount | Re-render all sections |
| Cart | Zustand in-memory | User action | Instant (no network) |
| Wishlist (read) | `getWishlist()` cookie → `GET /api/v1/products?ids[]=` | Page mount | Local product array |
| Wishlist (write) | `addToWishlist / removeFromWishlist` | Click | Cookie update only |
| Cart count in Header | `useCartStore(state => state.totalItems)` | Zustand subscription | Badge re-render |
| Checkout — shipping methods | SWR or `useEffect` fetch | Page mount | Shipping method selector |
| Checkout — coupon | `fetch` on button click | Click | Show discount/error |
| Checkout — place order | `fetch POST` on form submit | Submit | Redirect to /success |
| Order tracking | `fetch GET` on form submit | Submit | Router push to /order-status |
| Order status page | `useSearchParams` + SWR | Page mount | Render timeline |
| Feedback page items | `useSearchParams` (order #) + `GET /api/v1/orders/:num/track` | Page mount | Render product list |
| Review submit | `fetch POST` on modal submit | Button click | Update rated state |
| Admin login | `adminAuthService.login()` | Form submit | Cookie + redirect |

---

### 2.2 Zustand Cart Store Structure

```typescript
// lib/cart.ts (required shape)
interface CartItem {
  product_id: number;
  slug: string;
  name: string;
  subtitle: string;
  image_url: string;
  size_id: number;
  volume_ml: number;
  price: number;           // current sale price
  original_price: number;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (product_id: number, size_id: number) => void;
  updateQty: (product_id: number, size_id: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;      // computed from items
  subtotal: number;        // computed from items
}
```

---

### 2.3 Zustand Admin Auth Store Structure

```typescript
// lib/stores/adminAuth.ts
interface AdminAuthStore {
  admin: { id: number; name: string; email: string } | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}
```

---

### 2.4 API Client Configuration

```typescript
// lib/apiClient.ts  (Axios singleton)
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api',
  withCredentials: true,                  // Sanctum cookies
  headers: { Accept: 'application/json' }
});
```

---

## 3. BACKEND ARCHITECTURE

### 3.1 Framework & Configuration

| Item | Value |
|---|---|
| Framework | Laravel 11 |
| PHP | 8.2+ |
| Auth | Laravel Sanctum (HttpOnly SPA cookie mode) |
| HTTP | `stateful_domains: ['localhost:3000']` |
| Token cookie | `admin_token` |
| CORS | `frontend_url: env('FRONTEND_URL', 'http://localhost:3000')` |

---

### 3.2 Route Groups

```
Public (throttle: 120/min)
├── GET  /api/v1/products
├── GET  /api/v1/products/{slug}
├── GET  /api/v1/brands
├── GET  /api/v1/categories
├── GET  /api/v1/shipping-methods
├── POST /api/v1/orders
├── GET  /api/v1/orders/{orderNumber}/track
├── POST /api/v1/coupons/validate
└── POST /api/v1/reviews

Admin Auth (throttle: 10/min)
├── POST /api/v1/admin/auth/login
└── POST /api/v1/admin/auth/logout

Admin Protected (auth:sanctum + ensure.admin + throttle: 300/min)
├── GET    /api/v1/admin/dashboard/stats
├── GET    /api/v1/admin/products        + POST / GET {id} / PATCH {id} / DELETE {id}
├── GET    /api/v1/admin/orders          + GET {id} / PATCH {id}/status
├── GET    /api/v1/admin/reviews         + PATCH {id}
├── GET    /api/v1/admin/brands          + POST / PATCH {id} / DELETE {id}
├── GET    /api/v1/admin/categories      + POST / PATCH {id} / DELETE {id}
└── GET    /api/v1/admin/coupons         + POST / PATCH {id} / DELETE {id}
```

---

### 3.3 Middleware Stack

```
HTTP Kernel
└── api middleware group
    ├── ThrottleRequests (120/min public, 10/min admin-auth, 300/min admin-protected)
    ├── SubstituteBindings
    ├── SecurityHeaders          → X-Frame-Options, X-Content-Type, Referrer-Policy, HSTS
    └── [protected routes only]
        ├── auth:sanctum         → validates admin_token cookie
        └── ensure.admin         → verifies user has is_admin=true
```

---

### 3.4 Models & Relationships

```
Admin              — id, name, email, password, is_admin, timestamps
Brand              — id, name, slug, logo_url, description, is_active, timestamps
Category           — id, name, slug, description, image_url, display_order, is_active, timestamps
Product            — id, brand_id, category_id, name, slug(unique), subtitle, description,
                     gender(enum: men/women/unisex), is_featured, is_active, timestamps
                     hasMany ProductImages, ProductSizes, Reviews
                     belongsTo Brand, Category
ProductImage       — id, product_id, image_url, sort_order, is_primary, timestamps
ProductSize        — id, product_id, volume_ml, price, original_price, stock_quantity, sku, timestamps
ShippingMethod     — id, name, label, price, free_above, is_active, timestamps
Coupon             — id, code(unique), type(enum: flat/percent), value, min_order_amount,
                     max_discount_amount, usage_limit, used_count, expires_at, is_active, timestamps
Order              — id, order_number(unique), customer_name, customer_phone, customer_email?,
                     shipping_address(json), shipping_method_id, coupon_id?, subtotal, shipping_cost,
                     coupon_discount, total, status(enum), payment_method, notes?, timestamps
                     hasMany OrderItems, OrderStatusHistories
                     belongsTo ShippingMethod, Coupon
OrderItem          — id, order_id, product_id, product_size_id, product_name, product_size_label,
                     unit_price, quantity, line_total, timestamps
OrderStatusHistory — id, order_id, status, note?, changed_at, timestamps
Review             — id, product_id, order_id?, reviewer_name, rating(1-5), body, is_approved,
                     is_featured, timestamps
                     hasMany ReviewImages
ReviewImage        — id, review_id, image_url, timestamps
```

---

### 3.5 Service Layer

```
OrderService
├── createOrder(PlaceOrderRequest $request): Order
│   ├── Generate unique order_number (LX-XXXX-X format)
│   ├── Validate & apply coupon
│   ├── Resolve shipping method
│   ├── Create Order record
│   ├── Loop items → decrement stock on ProductSize
│   ├── Create OrderItems
│   └── Create initial OrderStatusHistory (status: pending)
└── (Future) sendConfirmationSms(Order $order): void
```

---

### 3.6 Controllers

| Controller | Route Group | Key Methods |
|---|---|---|
| `ProductController` | Public | `index` (filters+pagination), `show` (by slug) |
| `BrandController` | Public | `index` (active brands) |
| `CategoryController` | Public | `index` (active categories, ordered) |
| `ShippingMethodController` | Public | `index` (active methods) |
| `OrderController` | Public | `store` (place order), `track` (by order_number+phone) |
| `CouponController` | Public | `validate` (check code + min amount) |
| `ReviewController` | Public | `store` (submit review, default unapproved) |
| `AdminAuthController` | Admin Auth | `login`, `logout` |
| `AdminDashboardController` | Admin Protected | `stats` (counts + revenue) |
| `AdminProductController` | Admin Protected | Full CRUD + `toggleFeatured` |
| `AdminOrderController` | Admin Protected | `index`, `show`, `updateStatus` |
| `AdminReviewController` | Admin Protected | `index`, `approve`, `reject` |
| `AdminBrandController` | Admin Protected | Full CRUD |
| `AdminCategoryController` | Admin Protected | Full CRUD |
| `AdminCouponController` | Admin Protected | Full CRUD |

---

### 3.7 API Resources

| Resource | Scope | Fields |
|---|---|---|
| `ProductListResource` | Collection | id, name, slug, subtitle, brand.name, category.name, primary_image, min_price, max_price, avg_rating, review_count, gender, is_featured, badges |
| `ProductDetailResource` | Single | All list fields + description, all images[], all sizes[], ingredients, reviews[] |
| `BrandResource` | Collection | id, name, slug, logo_url |
| `CategoryResource` | Collection | id, name, slug, image_url, display_order |
| `ShippingMethodResource` | Collection | id, name, label, price, free_above |
| `OrderResource` | Single | order_number, status, customer_*, shipping_address, items[], totals, status_histories[] |
| `OrderTrackResource` | Public Track | order_number, customer_name, status, status_histories[], items[] (no prices), shipping_address (city only) |
| `CouponValidateResource` | Single | valid, discount_type, discount_value, savings_amount, message |
| `ReviewResource` | Collection/Single | id, reviewer_name, rating, body, images[], created_at |

---

### 3.8 Form Requests

| Request | Validates |
|---|---|
| `PlaceOrderRequest` | customer_name, customer_phone (MAR format), shipping_address (json: city, quartier, zip, address), shipping_method_id, coupon_code?, items[] (product_id, size_id, quantity) |
| `StoreReviewRequest` | product_id (exists), order_id? (exists), reviewer_name, rating (1-5), body, images (optional array of files) |
| `ValidateCouponRequest` | code, order_total (numeric min 0) |
| `UpdateOrderStatusRequest` | status (enum), note? |

---

## 4. DATABASE DESIGN

### Entity Relationship Overview

```
brands (1) ──< products (∞)
categories (1) ──< products (∞)

products (1) ──< product_images (∞)
products (1) ──< product_sizes (∞)
products (1) ──< reviews (∞)
products (1) ──< order_items (∞)

shipping_methods (1) ──< orders (∞)
coupons (1) ──< orders (∞)   [nullable]

orders (1) ──< order_items (∞)
orders (1) ──< order_status_histories (∞)
orders (1) ──< reviews (∞)   [nullable, for verified purchase]

reviews (1) ──< review_images (∞)
```

---

### 4.1 Table Specifications

#### `admins`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK, auto-increment |
| name | varchar(255) | NOT NULL |
| email | varchar(255) | UNIQUE NOT NULL |
| password | varchar(255) | NOT NULL |
| is_admin | tinyint(1) | DEFAULT 1 |
| remember_token | varchar(100) | nullable |
| created_at / updated_at | timestamp | |

---

#### `brands`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| name | varchar(255) | NOT NULL |
| slug | varchar(255) | UNIQUE NOT NULL |
| logo_url | varchar(500) | nullable |
| description | text | nullable |
| is_active | tinyint(1) | DEFAULT 1 |
| created_at / updated_at | timestamp | |
**Index:** `idx_brands_active` on `is_active`

---

#### `categories`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| name | varchar(255) | NOT NULL |
| slug | varchar(255) | UNIQUE NOT NULL |
| description | text | nullable |
| image_url | varchar(500) | nullable |
| display_order | int | DEFAULT 0 |
| is_active | tinyint(1) | DEFAULT 1 |
| created_at / updated_at | timestamp | |
**Index:** `idx_categories_active_order` on (`is_active`, `display_order`)

---

#### `products`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| brand_id | bigint unsigned | FK → brands.id (restrict) |
| category_id | bigint unsigned | FK → categories.id (restrict) |
| name | varchar(255) | NOT NULL |
| slug | varchar(255) | UNIQUE NOT NULL |
| subtitle | varchar(255) | nullable |
| description | text | nullable |
| gender | enum('men','women','unisex') | NOT NULL |
| is_featured | tinyint(1) | DEFAULT 0 |
| is_active | tinyint(1) | DEFAULT 1 |
| created_at / updated_at | timestamp | |
**Indexes:** `idx_products_brand`, `idx_products_category`, `idx_products_gender`, `idx_products_featured_active`

---

#### `product_images`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| product_id | bigint unsigned | FK → products.id (cascade) |
| image_url | varchar(500) | NOT NULL |
| sort_order | int | DEFAULT 0 |
| is_primary | tinyint(1) | DEFAULT 0 |
| created_at / updated_at | timestamp | |
**Index:** `idx_product_images_product_primary` on (`product_id`, `is_primary`)

---

#### `product_sizes`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| product_id | bigint unsigned | FK → products.id (cascade) |
| volume_ml | int unsigned | NOT NULL |
| price | decimal(10,2) | NOT NULL |
| original_price | decimal(10,2) | nullable |
| stock_quantity | int unsigned | DEFAULT 0 |
| sku | varchar(100) | UNIQUE NOT NULL |
| created_at / updated_at | timestamp | |
**Index:** `idx_product_sizes_product`

---

#### `shipping_methods`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| name | varchar(100) | UNIQUE NOT NULL |
| label | varchar(255) | NOT NULL |
| price | decimal(10,2) | DEFAULT 0 |
| free_above | decimal(10,2) | nullable (null = never free) |
| is_active | tinyint(1) | DEFAULT 1 |
| created_at / updated_at | timestamp | |

---

#### `coupons`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| code | varchar(50) | UNIQUE NOT NULL |
| type | enum('flat','percent') | NOT NULL |
| value | decimal(10,2) | NOT NULL |
| min_order_amount | decimal(10,2) | DEFAULT 0 |
| max_discount_amount | decimal(10,2) | nullable |
| usage_limit | int unsigned | nullable (null = unlimited) |
| used_count | int unsigned | DEFAULT 0 |
| expires_at | timestamp | nullable |
| is_active | tinyint(1) | DEFAULT 1 |
| created_at / updated_at | timestamp | |

---

#### `orders`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| order_number | varchar(20) | UNIQUE NOT NULL (e.g. LX-8921-Q) |
| customer_name | varchar(255) | NOT NULL |
| customer_phone | varchar(20) | NOT NULL |
| customer_email | varchar(255) | nullable |
| shipping_address | json | NOT NULL |
| shipping_method_id | bigint unsigned | FK → shipping_methods.id (restrict) |
| coupon_id | bigint unsigned | nullable FK → coupons.id (set null) |
| subtotal | decimal(10,2) | NOT NULL |
| shipping_cost | decimal(10,2) | DEFAULT 0 |
| coupon_discount | decimal(10,2) | DEFAULT 0 |
| total | decimal(10,2) | NOT NULL |
| status | enum('pending','confirmed','dispatched','shipped','delivered','cancelled') | DEFAULT 'pending' |
| payment_method | varchar(50) | DEFAULT 'cod' (cash on delivery) |
| notes | text | nullable |
| created_at / updated_at | timestamp | |
**Indexes:** `idx_orders_number`, `idx_orders_phone`, `idx_orders_status`

---

#### `order_items`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| order_id | bigint unsigned | FK → orders.id (cascade) |
| product_id | bigint unsigned | FK → products.id (restrict) |
| product_size_id | bigint unsigned | FK → product_sizes.id (restrict) |
| product_name | varchar(255) | NOT NULL (snapshot) |
| product_size_label | varchar(50) | NOT NULL (snapshot, e.g. "50ml") |
| unit_price | decimal(10,2) | NOT NULL (snapshot) |
| quantity | int unsigned | NOT NULL |
| line_total | decimal(10,2) | NOT NULL |
| created_at / updated_at | timestamp | |

---

#### `order_status_histories`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| order_id | bigint unsigned | FK → orders.id (cascade) |
| status | varchar(50) | NOT NULL |
| note | text | nullable |
| changed_at | timestamp | NOT NULL DEFAULT CURRENT_TIMESTAMP |
**Index:** `idx_osh_order` on `order_id`

---

#### `reviews`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| product_id | bigint unsigned | FK → products.id (cascade) |
| order_id | bigint unsigned | nullable FK → orders.id (set null) |
| reviewer_name | varchar(255) | NOT NULL |
| rating | tinyint unsigned | NOT NULL (1–5) |
| body | text | NOT NULL |
| is_approved | tinyint(1) | DEFAULT 0 |
| is_featured | tinyint(1) | DEFAULT 0 |
| created_at / updated_at | timestamp | |
**Indexes:** `idx_reviews_product`, `idx_reviews_approved`, `idx_reviews_featured`

---

#### `review_images`
| Column | Type | Constraints |
|---|---|---|
| id | bigint unsigned | PK |
| review_id | bigint unsigned | FK → reviews.id (cascade) |
| image_url | varchar(500) | NOT NULL |
| created_at / updated_at | timestamp | |

---

## 5. API ↔ FRONTEND MAPPING

| HTTP | Endpoint | Frontend Consumer | Payload / Params |
|---|---|---|---|
| GET | `/api/v1/brands` | `BrandLogos.tsx`, collection filter sidebar | — |
| GET | `/api/v1/categories` | `CategoriesSection.tsx`, collection filter sidebar | — |
| GET | `/api/v1/products` | `BestSellers.tsx`, `collection/page.tsx`, `wishlist/page.tsx` | `brand[]`, `category[]`, `gender`, `price_min`, `price_max`, `sort`, `page`, `limit`, `ids[]`, `is_featured`, `search` |
| GET | `/api/v1/products/{slug}` | `product/[slug]/page.tsx` | — |
| GET | `/api/v1/shipping-methods` | `checkout/page.tsx` | — |
| POST | `/api/v1/coupons/validate` | `checkout/page.tsx` "Appliquer" button | `{ code, order_total }` |
| POST | `/api/v1/orders` | `checkout/page.tsx` form submit | `{ customer_name, customer_phone, shipping_address{}, shipping_method_id, coupon_code?, items[{product_id, size_id, quantity}] }` |
| GET | `/api/v1/orders/{orderNumber}/track` | `track-order/page.tsx` (submit), `order-status/page.tsx` (mount), `feedback/page.tsx` (mount) | `?phone=` |
| POST | `/api/v1/reviews` | `ReviewModal.tsx` "Publish review" button | `{ product_id, order_id?, reviewer_name, rating, body, images[]? }` |
| GET | `/api/v1/reviews` | `CustomerReviewsSection.tsx` | `?approved=true&featured=true&limit=4` |
| POST | `/api/v1/admin/auth/login` | `admin/login/page.tsx` | `{ email, password }` |
| POST | `/api/v1/admin/auth/logout` | Admin header/logout button | — |
| GET | `/api/v1/admin/dashboard/stats` | `admin/dashboard/page.tsx` (not yet built) | — |
| GET/POST/PATCH/DELETE | `/api/v1/admin/products` | Admin product management (not yet built) | — |
| GET/PATCH | `/api/v1/admin/orders` | Admin order management (not yet built) | — |
| GET/PATCH | `/api/v1/admin/reviews` | Admin review moderation (not yet built) | — |
| * | `/api/v1/admin/brands` | Admin brand management (not yet built) | — |
| * | `/api/v1/admin/categories` | Admin category management (not yet built) | — |
| * | `/api/v1/admin/coupons` | Admin coupon management (not yet built) | — |

---

## 6. EXECUTION FLOW DIAGRAMS

### 6.1 Home Page Load

```
Browser → GET /
          ↓
     Next.js Server Component (app/page.tsx)
          ↓ renders static shell
     Client hydration
          ↓
     SWR parallel fetches:
     ┌──────────────────────────────────────────────────────┐
     │ GET /api/v1/products?is_featured=true&limit=5        │ → BestSellers
     │ GET /api/v1/brands                                   │ → BrandLogos
     │ GET /api/v1/categories                               │ → CategoriesSection
     │ GET /api/v1/reviews?approved=true&featured=true      │ → CustomerReviews
     └──────────────────────────────────────────────────────┘
          ↓ responses arrive (stale-while-revalidate)
     UI updates with real data
```

---

### 6.2 Add to Cart Flow

```
User: clicks "Add to Cart" on ProductCard or Product Detail
          ↓
     No API call (Zustand is in-memory)
          ↓
     useCartStore.addItem({
       product_id, slug, name, size_id, volume_ml,
       price, original_price, quantity: 1
     })
          ↓ Zustand subscription
     Header badge re-renders (totalItems count)
     CartDrawer opens (if triggered)
```

---

### 6.3 Checkout → Order Placement

```
User: navigates to /checkout
          ↓
     'use client' component mounts
          ↓
     Parallel:
     ├── useCartStore() → reads current cart items + subtotal
     └── GET /api/v1/shipping-methods → renders 3 shipping options

User: fills shipping form + selects method
          ↓
User: enters coupon code + clicks "Appliquer"
          ↓
     POST /api/v1/coupons/validate { code, order_total }
     ← { valid: true, savings_amount: 200, message: "VOUS ÉCONOMISEZ 200 DH" }
          ↓ (or error if invalid)
     CouponValidateResource sets coupon_discount in local state

User: clicks "Passer la commande"
          ↓
     Form validation (HTML5 + custom)
          ↓
     POST /api/v1/orders {
       customer_name, customer_phone,
       shipping_address: { city, quartier, zip, address },
       shipping_method_id,
       coupon_code?,
       items: [{ product_id, size_id, quantity }]
     }
          ↓
     Backend: OrderService.createOrder()
     ├── Validate coupon
     ├── Check stock per size
     ├── Create orders row
     ├── Create order_items rows
     ├── Decrement product_sizes.stock_quantity
     ├── Increment coupons.used_count
     └── Create order_status_histories (status: pending)
          ↓
     ← 201 { data: { order_number: "LX-XXXX-X", total: 795 } }
          ↓
     useCartStore.clearCart()
          ↓
     router.push('/success?order=LX-XXXX-X&total=795&name=...')
```

---

### 6.4 Order Tracking Flow

```
User: navigates to /track-order
          ↓
     Enters order_number + customer_phone
          ↓
     GET /api/v1/orders/{orderNumber}/track?phone=0612345678
          ↓
     Backend: OrderController.track()
     ├── Find order by order_number
     ├── Verify customer_phone matches
     └── Return OrderTrackResource (status_histories, items, city only)
          ↓
     ← 200 { data: { status_histories: [...], items: [...] } }
          ↓
     router.push('/order-status?order=LX-XXXX-X&phone=0612345678')
          ↓
     order-status/page.tsx mounts
          ↓
     useSearchParams() → order, phone
          ↓
     GET /api/v1/orders/{order}/track?phone=... (re-fetch on client)
          ↓
     Map status_histories → 4-step timeline UI
```

---

### 6.5 Wishlist Flow

```
User: clicks heart on ProductCard
          ↓
     isInWishlist(product.id) checked from cookie
     toggleWishlist(product.id) → addToWishlist / removeFromWishlist
          ↓ cookie update (bloom_wishlist, 30 days)
     Heart icon state updates

User: navigates to /wishlist
          ↓
     'use client' mounts
          ↓
     getWishlist() → [1, 4, 7, ...]  (product IDs from cookie)
          ↓
     GET /api/v1/products?ids[]=1&ids[]=4&ids[]=7
          ↓
     ← ProductListResource[] for those IDs
          ↓
     Renders product cards with Remove heart + Add to Bag button
```

---

### 6.6 Admin Login Flow

```
Admin: navigates to /admin/login
          ↓
     Enters email + password
          ↓
     adminAuthService.login({ email, password })
          ↓
     POST /api/v1/admin/auth/login { email, password }
          ↓
     Backend: AdminAuthController.login()
     ├── credentials check (admins table, is_admin = 1)
     ├── Sanctum: $user->createToken('admin_token', ['*'])
     └── Cookie: HttpOnly admin_token set (SameSite: Lax)
          ↓
     ← 200 { data: { admin: { id, name, email } } }
          ↓
     router.push('/admin/dashboard')

Subsequent admin requests:
     Request headers: Cookie: admin_token=...
          ↓
     auth:sanctum middleware validates cookie
          ↓
     ensure.admin checks is_admin = true
          ↓
     Controller executes
```

---

### 6.7 Review Submission Flow

```
User: navigates to /feedback?order=LX-XXXX-X
          ↓
     useSearchParams() → order number
          ↓
     GET /api/v1/orders/{orderNumber}/track?phone=...
     ← items[]: [{ product_id, product_name, product_image }]
          ↓
     Renders per-product rating rows

User: clicks star rating on a product row
          ↓
     setSelectedProduct(product) + setIsModalOpen(true)
          ↓
     ReviewModal opens with productName, productDesc, productImage

User: selects star rating + writes review text + clicks "Publish review"
          ↓
     POST /api/v1/reviews {
       product_id,
       order_id,
       reviewer_name: customer_name_from_order,
       rating,
       body,
       images[]?   (optional file uploads)
     }
          ↓
     Backend: ReviewController.store()
     ├── StoreReviewRequest validates
     ├── Create reviews row (is_approved: false by default)
     └── Create review_images if files uploaded
          ↓
     ← 201 { data: { message: "Review submitted, pending approval" } }
          ↓
     Modal closes
     Product row shows CheckCircle2 (rated) state
```

---

## 7. SEEDER REFERENCE DATA

### 7.1 Admin Seeder

```json
{
  "name": "Bloom Admin",
  "email": "admin@bloomparfums.ma",
  "password": "bcrypt(Bloom@Admin2025!)",
  "is_admin": true
}
```

---

### 7.2 Brands Seeder (8 records)

```json
[
  { "name": "Giorgio Armani", "slug": "giorgio-armani" },
  { "name": "Chanel",         "slug": "chanel" },
  { "name": "Dior",           "slug": "dior" },
  { "name": "Prada",          "slug": "prada" },
  { "name": "Lancôme",        "slug": "lancome" },
  { "name": "Hugo Boss",      "slug": "hugo-boss" },
  { "name": "Gucci",          "slug": "gucci" },
  { "name": "Balenciaga",     "slug": "balenciaga" }
]
```

---

### 7.3 Categories Seeder (6 records)

```json
[
  { "name": "Lavender",          "slug": "lavender",           "display_order": 1 },
  { "name": "Lily of the Valley","slug": "lily-of-the-valley", "display_order": 2 },
  { "name": "Patchouli",         "slug": "patchouli",           "display_order": 3 },
  { "name": "Sandalwood",        "slug": "sandalwood",          "display_order": 4 },
  { "name": "Citrus",            "slug": "citrus",              "display_order": 5 },
  { "name": "Jasmine",           "slug": "jasmine",             "display_order": 6 }
]
```

---

### 7.4 Shipping Methods Seeder (3 records)

```json
[
  {
    "name": "free",
    "label": "Livraison Gratuite (>590 DH)",
    "price": 0.00,
    "free_above": 590.00,
    "is_active": true
  },
  {
    "name": "region",
    "label": "Région — Casablanca / Rabat",
    "price": 20.00,
    "free_above": null,
    "is_active": true
  },
  {
    "name": "national",
    "label": "National (Tout le Maroc)",
    "price": 35.00,
    "free_above": null,
    "is_active": true
  }
]
```

---

### 7.5 Coupons Seeder (2 records)

```json
[
  {
    "code": "MYBLOOMAZ",
    "type": "flat",
    "value": 200.00,
    "min_order_amount": 400.00,
    "max_discount_amount": null,
    "usage_limit": 100,
    "used_count": 0,
    "expires_at": "2025-12-31T23:59:59Z",
    "is_active": true
  },
  {
    "code": "BLOOM15",
    "type": "percent",
    "value": 15.00,
    "min_order_amount": 0.00,
    "max_discount_amount": 300.00,
    "usage_limit": null,
    "used_count": 0,
    "expires_at": null,
    "is_active": true
  }
]
```

---

### 7.6 Products Seeder (10 records, abbreviated)

```json
[
  {
    "brand": "Giorgio Armani",
    "category": "Lavender",
    "name": "Midnight Bloom",
    "slug": "midnight-bloom",
    "subtitle": "Eau de Parfum",
    "gender": "unisex",
    "is_featured": true,
    "sizes": [
      { "volume_ml": 30,  "price": 128, "original_price": 160, "stock_quantity": 45, "sku": "MB-30" },
      { "volume_ml": 50,  "price": 198, "original_price": 248, "stock_quantity": 0,  "sku": "MB-50" },
      { "volume_ml": 100, "price": 298, "original_price": 370, "stock_quantity": 12, "sku": "MB-100" }
    ]
  },
  {
    "brand": "Chanel",
    "category": "Citrus",
    "name": "Oceanic Drift",
    "slug": "oceanic-drift",
    "subtitle": "Eau de Toilette",
    "gender": "men",
    "is_featured": true,
    "sizes": [
      { "volume_ml": 50,  "price": 169, "original_price": 210, "stock_quantity": 30, "sku": "OD-50" },
      { "volume_ml": 100, "price": 249, "original_price": 315, "stock_quantity": 18, "sku": "OD-100" }
    ]
  },
  {
    "brand": "Dior",
    "category": "Jasmine",
    "name": "Velvet Rose",
    "slug": "velvet-rose",
    "subtitle": "Eau de Parfum Intense",
    "gender": "women",
    "is_featured": true,
    "sizes": [
      { "volume_ml": 30,  "price": 248, "original_price": 310, "stock_quantity": 20, "sku": "VR-30" },
      { "volume_ml": 50,  "price": 328, "original_price": 410, "stock_quantity": 9,  "sku": "VR-50" },
      { "volume_ml": 100, "price": 458, "original_price": 575, "stock_quantity": 0,  "sku": "VR-100" }
    ]
  },
  {
    "brand": "Prada",
    "category": "Lily of the Valley",
    "name": "Silk Petals",
    "slug": "silk-petals",
    "subtitle": "Eau de Parfum",
    "gender": "women",
    "is_featured": true,
    "sizes": [
      { "volume_ml": 50,  "price": 178, "original_price": 220, "stock_quantity": 35, "sku": "SP-50" },
      { "volume_ml": 100, "price": 258, "original_price": 320, "stock_quantity": 14, "sku": "SP-100" }
    ]
  },
  {
    "brand": "Lancôme",
    "category": "Sandalwood",
    "name": "Sugar Pop",
    "slug": "sugar-pop",
    "subtitle": "Body Butter",
    "gender": "women",
    "is_featured": true,
    "sizes": [
      { "volume_ml": 50,  "price": 140, "original_price": 200, "stock_quantity": 50, "sku": "SGPOP-50" }
    ]
  },
  {
    "brand": "Hugo Boss",
    "category": "Citrus",
    "name": "Sauvage Night",
    "slug": "sauvage-night",
    "subtitle": "Eau de Parfum",
    "gender": "men",
    "is_featured": false,
    "sizes": [
      { "volume_ml": 100, "price": 320, "original_price": 410, "stock_quantity": 22, "sku": "SN-100" }
    ]
  },
  {
    "brand": "Gucci",
    "category": "Patchouli",
    "name": "Tabac d'Or",
    "slug": "tabac-dor",
    "subtitle": "Eau de Parfum",
    "gender": "unisex",
    "is_featured": false,
    "sizes": [
      { "volume_ml": 50,  "price": 215, "original_price": 270, "stock_quantity": 8,  "sku": "TO-50" },
      { "volume_ml": 100, "price": 310, "original_price": 390, "stock_quantity": 3,  "sku": "TO-100" }
    ]
  },
  {
    "brand": "Balenciaga",
    "category": "Lavender",
    "name": "Iris Blanche",
    "slug": "iris-blanche",
    "subtitle": "Eau de Parfum",
    "gender": "women",
    "is_featured": false,
    "sizes": [
      { "volume_ml": 30,  "price": 185, "original_price": null, "stock_quantity": 15, "sku": "IB-30" },
      { "volume_ml": 50,  "price": 265, "original_price": null, "stock_quantity": 7,  "sku": "IB-50" }
    ]
  },
  {
    "brand": "Chanel",
    "category": "Jasmine",
    "name": "Fleur de Minuit",
    "slug": "fleur-de-minuit",
    "subtitle": "Eau de Parfum",
    "gender": "women",
    "is_featured": false,
    "sizes": [
      { "volume_ml": 50,  "price": 295, "original_price": 370, "stock_quantity": 11, "sku": "FDM-50" },
      { "volume_ml": 100, "price": 420, "original_price": 530, "stock_quantity": 5,  "sku": "FDM-100" }
    ]
  },
  {
    "brand": "Dior",
    "category": "Sandalwood",
    "name": "Ambre Mystère",
    "slug": "ambre-mystere",
    "subtitle": "Eau de Parfum Oriental",
    "gender": "unisex",
    "is_featured": false,
    "sizes": [
      { "volume_ml": 100, "price": 385, "original_price": 490, "stock_quantity": 19, "sku": "AM-100" }
    ]
  }
]
```

---

### 7.7 Sample Orders Seeder (3 records)

```json
[
  {
    "order_number": "LX-8921-Q",
    "customer_name": "Fatima Zahra Benali",
    "customer_phone": "+212678562312",
    "shipping_address": {
      "city": "Agadir",
      "quartier": "Ait Melloul",
      "zip": "80350",
      "address": "Rue 15, Résidence Atlas"
    },
    "shipping_method": "national",
    "coupon_code": null,
    "subtotal": 760.00,
    "shipping_cost": 35.00,
    "coupon_discount": 0.00,
    "total": 795.00,
    "status": "delivered",
    "items": [
      { "slug": "velvet-rose",   "volume_ml": 30,  "quantity": 1 },
      { "slug": "oceanic-drift", "volume_ml": 50,  "quantity": 2 }
    ]
  },
  {
    "order_number": "LX-1043-R",
    "customer_name": "Youssef Elkhattab",
    "customer_phone": "+212661234567",
    "shipping_address": {
      "city": "Casablanca",
      "quartier": "Maarif",
      "zip": "20360",
      "address": "Bd Zerktouni Apt 4B"
    },
    "shipping_method": "region",
    "coupon_code": "MYBLOOMAZ",
    "subtotal": 596.00,
    "shipping_cost": 20.00,
    "coupon_discount": 200.00,
    "total": 416.00,
    "status": "shipped",
    "items": [
      { "slug": "midnight-bloom", "volume_ml": 50, "quantity": 1 },
      { "slug": "sugar-pop",      "volume_ml": 50, "quantity": 2 }
    ]
  },
  {
    "order_number": "LX-2077-M",
    "customer_name": "Nadia Chraibi",
    "customer_phone": "+212698765432",
    "shipping_address": {
      "city": "Marrakech",
      "quartier": "Guéliz",
      "zip": "40000",
      "address": "Rue Ibn Aicha, Résidence Menara"
    },
    "shipping_method": "national",
    "coupon_code": "BLOOM15",
    "subtotal": 448.00,
    "shipping_cost": 35.00,
    "coupon_discount": 67.20,
    "total": 415.80,
    "status": "pending",
    "items": [
      { "slug": "silk-petals",  "volume_ml": 50,  "quantity": 1 },
      { "slug": "iris-blanche", "volume_ml": 30,  "quantity": 1 }
    ]
  }
]
```

---

### 7.8 Sample Reviews Seeder (5 records)

```json
[
  {
    "product_slug": "midnight-bloom",
    "order_number": "LX-8921-Q",
    "reviewer_name": "Fatima Zahra B.",
    "rating": 5,
    "body": "Une fragrance envoûtante qui dure toute la journée. Les notes lavande sont parfaitement dosées.",
    "is_approved": true,
    "is_featured": true
  },
  {
    "product_slug": "velvet-rose",
    "order_number": null,
    "reviewer_name": "Sofia K.",
    "rating": 4,
    "body": "Très belle tenue, la rose est présente sans être trop lourde. Je recommande pour une occasion spéciale.",
    "is_approved": true,
    "is_featured": true
  },
  {
    "product_slug": "oceanic-drift",
    "order_number": null,
    "reviewer_name": "Mehdi A.",
    "rating": 5,
    "body": "Parfum masculin frais et dynamique. Idéal pour l'été, la sillage est impressionnant.",
    "is_approved": true,
    "is_featured": true
  },
  {
    "product_slug": "sugar-pop",
    "order_number": "LX-1043-R",
    "reviewer_name": "Amina R.",
    "rating": 4,
    "body": "Très gourmand et sucré. Parfait pour la saison froide. Le flacon est magnifique!",
    "is_approved": true,
    "is_featured": false
  },
  {
    "product_slug": "silk-petals",
    "order_number": null,
    "reviewer_name": "Khadija M.",
    "rating": 3,
    "body": "Joli parfum floral mais la tenue n'est pas assez longue pour moi. Belle présentation.",
    "is_approved": false,
    "is_featured": false
  }
]
```

---

## 8. VALIDATION SUMMARY & GAP ANALYSIS

### 8.1 Backend Coverage ✅

Every frontend-facing API call has a corresponding controller method, route, and database table:

| Frontend Need | Backend Route | Table | Status |
|---|---|---|---|
| Brand list for logos & filter | `GET /api/v1/brands` | `brands` | ✅ |
| Category list for grid & filter | `GET /api/v1/categories` | `categories` | ✅ |
| Product list with filters | `GET /api/v1/products` | `products` + joins | ✅ |
| Product detail by slug | `GET /api/v1/products/{slug}` | `products` + `product_sizes` + `product_images` | ✅ |
| Shipping method options | `GET /api/v1/shipping-methods` | `shipping_methods` | ✅ |
| Coupon validation | `POST /api/v1/coupons/validate` | `coupons` | ✅ |
| Place order | `POST /api/v1/orders` | `orders` + `order_items` + stock decrement | ✅ |
| Track order by number+phone | `GET /api/v1/orders/{num}/track` | `orders` + `order_status_histories` + `order_items` | ✅ |
| Submit review | `POST /api/v1/reviews` | `reviews` + `review_images` | ✅ |
| Featured review list | `GET /api/v1/reviews?featured=true` | `reviews` | ✅ |
| Admin login | `POST /api/v1/admin/auth/login` | `admins` | ✅ |

---

### 8.2 Frontend Hardcoding Gaps — Action Required

| Component / Page | What is Hardcoded | Fix Required |
|---|---|---|
| `BestSellers.tsx` | 5 product objects | Accept `products[]` prop, fetch via SWR in `app/page.tsx` |
| `BrandLogos.tsx` | 9 brand name strings | Fetch `GET /api/v1/brands`, map to scrolling strip |
| `CategoriesSection.tsx` | 6 olfactory category objects | Fetch `GET /api/v1/categories` for the category grid |
| `CustomerReviewsSection.tsx` | Rating 4.5, count 2689, bar widths, 4 review cards | Fetch `GET /api/v1/reviews?featured=true` + aggregate stats |
| `collection/page.tsx` | Brand/category filter options + entire product grid | Wire all filters and product fetch to `GET /api/v1/products` |
| `product/[id]/page.tsx` | Entire product object, sizes, reviews | `GET /api/v1/products/{slug}` → ProductDetailResource |
| `checkout/page.tsx` | Cart items, shipping methods, coupon mock | Wire Zustand cart, `GET /api/v1/shipping-methods`, `POST /api/v1/coupons/validate` |
| `success/page.tsx` | Order number, address, total, phone | Read `?order=` URL params; optionally re-fetch |
| `order-status/page.tsx` | Entire timeline and items | Read URL params + `GET /api/v1/orders/{num}/track` |
| `wishlist/page.tsx` | 8 duplicated hardcoded items | `getWishlist()` cookie → `GET /api/v1/products?ids[]=` |
| `feedback/page.tsx` | 2 hardcoded product slots | Read order items from `GET /api/v1/orders/{num}/track` |
| `CartDrawer.tsx` | 3 hardcoded items, quantities | Wire to `useCartStore()` |
| `Header.tsx` | `cartCount = 0` | `useCartStore(s => s.totalItems)` |
| `ProductCard.tsx` | Wishlist toggle is local `useState` | Wire to `lib/wishlist.ts` toggle functions |
| `ReviewModal.tsx` | "Publish review" has no onClick | Wire to `POST /api/v1/reviews` |

---

### 8.3 Structural Issues — Must Fix

| Issue | Severity | Fix |
|---|---|---|
| `product/[id]/page.tsx` uses `params.id` but backend routes by `slug` | 🔴 HIGH | Rename route to `/product/[slug]` and update all `Link href` in ProductCard + home sections |
| `checkout/page.tsx` is a Server Component — Zustand cart inaccessible | 🔴 HIGH | Add `'use client'` directive and `useCartStore()` |
| `order-status/page.tsx` is a Server Component — cannot read `searchParams` reactively | 🔴 HIGH | Convert to `'use client'` + `useSearchParams()` |
| `ReviewModal.tsx` submit button has no `onClick` handler | 🔴 HIGH | Add `onSubmit(rating, body, images)` prop and wire to `POST /api/v1/reviews` |
| `Header.tsx` cart badge is static `useState(0)` | 🟡 MEDIUM | Subscribe to Zustand cart store |
| `ProductCard.tsx` wishlist button is local state, not persisted | 🟡 MEDIUM | Use `isInWishlist(id)` initial state + `toggleWishlist(id)` |
| Nav links in Header are all `href='#'` | 🟡 MEDIUM | Wire to: `/collection?gender=men`, `/collection?gender=women`, etc. |
| Search input in Header has no API call | 🟡 MEDIUM | Debounced `GET /api/v1/products?search=` with dropdown results |
| `success/page.tsx` shows hardcoded data — customer sees wrong order info | 🔴 HIGH | Read `searchParams.order` + display data passed from checkout |
| `feedback/page.tsx` hardcoded 2 products instead of real order items | 🟡 MEDIUM | Fetch order items from track endpoint |

---

### 8.4 Admin Dashboard Pages — Not Yet Built

The following admin pages have routes and controllers in the backend but **no frontend pages exist yet**:

| Page | Route | Controller |
|---|---|---|
| Dashboard stats | `/admin/dashboard` | `AdminDashboardController@stats` |
| Product management | `/admin/products` | `AdminProductController` (CRUD) |
| Order management | `/admin/orders` | `AdminOrderController` |
| Review moderation | `/admin/reviews` | `AdminReviewController` |
| Brand management | `/admin/brands` | `AdminBrandController` (CRUD) |
| Category management | `/admin/categories` | `AdminCategoryController` (CRUD) |
| Coupon management | `/admin/coupons` | `AdminCouponController` (CRUD) |

---

### 8.5 No Orphan Logic — Everything Accounted For

| Check | Result |
|---|---|
| Backend tables with no frontend consumer | ❌ None — all 14 tables are used |
| Frontend API calls with no backend route | ❌ None — all calls have matching routes |
| Backend routes with no frontend consumer | ⚠️ Admin CRUD pages (dashboard/products/orders/reviews) — expected, frontend not yet built |
| Cookie logic (`bloom_wishlist`) not connected to DB | ✅ Intentional design — wishlist is client-side only |
| Cart (Zustand) not persisted to DB | ✅ Intentional design — COD flow, no cart persistence needed |

---

### 8.6 Implementation Priority Queue

```
P0 — Blocking Core Commerce Flow
├── Convert checkout/page.tsx to 'use client' + wire Zustand cart
├── Wire checkout → POST /api/v1/orders → redirect /success
├── Fix product/[id] → product/[slug] route rename
├── Wire ProductDetail GET /api/v1/products/{slug}
└── Wire TrackOrder → OrderStatus with real API data

P1 — Customer-Facing Data Accuracy  
├── Replace hardcoded BestSellers with API fetch
├── Replace hardcoded CustomerReviewsSection with API fetch
├── Wire WishlistPage: cookie IDs → GET /api/v1/products?ids[]
├── Wire CartDrawer to Zustand store
└── Wire Header cart badge to Zustand store

P2 — Product Discovery & Browsing
├── Wire collection/page.tsx product grid to GET /api/v1/products  
├── Wire filter sidebar brand/category options from API
├── Wire BrandLogos to GET /api/v1/brands
└── Wire CategoriesSection to GET /api/v1/categories

P3 — Post-Purchase & Reviews
├── Wire ReviewModal submit to POST /api/v1/reviews
├── Wire feedback/page.tsx products from order items
└── Wire success/page.tsx to show real order data

P4 — Admin Dashboard Frontend
├── Build /admin/dashboard (stats + charts)
├── Build /admin/products (table + CRUD modals)
├── Build /admin/orders (table + status update)
└── Build /admin/reviews (approve/reject queue)
```

---

*Report generated by: GitHub Copilot (Claude Sonnet 4.6)*  
*Version: V4 — Post-Implementation Scan*  
*Architecture state: Backend complete (14 migrations clean), Frontend wiring in progress*
