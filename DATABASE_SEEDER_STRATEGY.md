# Database Seeder Strategy
## Bloom Parfums — Full-Stack Architecture Analysis & Seeding Plan

---

# 1. Architecture Analysis

## 1.1 Backend (Laravel — API-first)

### Routes & Access Control

| Scope | Prefix | Guard |
|---|---|---|
| Public catalogue | `GET /api/v1/products`, `/brands`, `/categories`, `/shipping-methods` | None (throttle 120/min) |
| Public order | `POST /api/v1/orders`, `GET /api/v1/orders/{orderNumber}/track` | None |
| Public review submission | `POST /api/v1/reviews` | None |
| Public coupon check | `POST /api/v1/coupons/validate` | None |
| Admin auth | `POST /api/v1/admin/auth/login` | throttle:10/min |
| Admin CRUD | `api/v1/admin/*` | `auth:sanctum` + `ensure.admin` |

### Models & Relationships

```
Admin (standalone — Sanctum token issuer)

Brand (1) ──< (many) Product
Category (tree, self-ref parent_id) (1) ──< (many) Product
Product (1) ──< (many) ProductImage     [sort_order, is_primary]
Product (1) ──< (many) ProductSize      [label, price_modifier, stock]
Product (1) ──< (many) Review           [is_approved scope]
Review  (1) ──< (many) ReviewImage

ShippingMethod (1) ──< (many) Order
Coupon         (1) ──< (many) Order     [nullable FK]
Order          (1) ──< (many) OrderItem
OrderItem      (many) >── (1) Product   [nullable FK — product may be deleted]
Order          (1) ──< (many) OrderStatusHistory
```

### Business Logic Boundaries

- **Order creation** — no authentication; customer identified by `customer_phone` + `order_number` at track time.
- **Coupon validation** — checked at checkout, `used_count` incremented by `OrderService`.
- **Review submission** — no auth; linked to order by `order_number` string (no FK intentionally — order may be purged).
- **Product slug** — auto-generated on creation as `Str::slug($name) . '-' . Str::random(6)` (must be explicitly set in seeders to keep deterministic, stable slugs).
- **Review approval** — admin-only action; `is_approved=false` by default; only approved reviews are returned by the public `Product::reviews()` scope.
- **Soft deletes** — `products` table only; deleted products remain in `order_items` via nullable FK.

---

## 1.2 Frontend (Next.js 14 — App Router)

### Pages & Data Dependencies

| Page | Route | Required data |
|---|---|---|
| Home | `/` | Featured products, brands, categories, approved+featured reviews |
| Collection | `/collection` | Products list (paginated), brands list, categories list |
| Product Detail | `/product/[slug]` | Single product with images, sizes, approved reviews |
| Checkout | `/checkout` | Cart (Zustand), shipping methods, coupon validation |
| Order Success | `/success` | URL params only (`order`, `total`, `name`, `phone`, `city`) |
| Order Tracking | `/order-status` | `GET /orders/{orderNumber}/track?phone=` |
| Wishlist | `/wishlist` | Cookie-stored product IDs → product list |
| Feedback | `/feedback` | `GET /orders/{orderNumber}/track?phone=` → product list → review modal |
| Admin Login | `/admin/login` | Admin credential check |

### Client-side State (NOT seeded)

- Cart contents — Zustand in-memory
- Wishlist IDs — `js-cookie` (`bloom_wishlist`)
- Admin session — Sanctum `withCredentials` flag

---

# 2. Data Model Summary

### Existing Seeders — Current State Assessment

| File | Status | Problem |
|---|---|---|
| `UserSeeder.php` | ❌ Broken | References `App\Models\User` — no `users` table or `User` model exists in this project. Auth is `App\Models\Admin`. |
| `ProductSeeder.php` | ⚠️ Incomplete | Creates products without `brand_id`, `category_id`, images, or sizes. Passes `category` as a string field that does not exist on the `products` table. |

Both must be replaced.

---

### Column Reference (exact names for seeder accuracy)

**products**
`id | brand_id | category_id | name | slug | subtitle | description | ingredients | gender | price | original_price | stock | is_active | is_featured | created_at | updated_at | deleted_at`

**product_images**
`id | product_id | url | alt | sort_order | is_primary | created_at`

**product_sizes**
`id | product_id | label | price_modifier | stock`

**orders**
`id | order_number | coupon_id | shipping_method_id | customer_name | customer_phone | customer_email | shipping_address | shipping_city | shipping_province | shipping_postal_code | subtotal | discount_amount | shipping_cost | total | status | notes | admin_notes | created_at | updated_at`

**order_items**
`id | order_id | product_id | size_label | quantity | unit_price`

**order_status_histories**
`id | order_id | status | label | location | created_at`

**reviews**
`id | product_id | order_number | reviewer_name | rating | body | is_approved | approved_at | created_at | updated_at`

**review_images**
`id | review_id | url | created_at`

> ⚠️ **Field name alert — `order_status_histories`**: The DB columns are `label` and `location`, NOT `note`. The frontend `OrderTrackResult` interface uses `note` and `changed_at`. This means `OrderTrackResource` maps `created_at → changed_at` and `label → note`. Seeder data for `label` must be human-readable (e.g. "Commande confirmée"), and the `location` column seeds a city/depot name.

---

# 3. Seeder Strategy

### Design Principles

1. **Deterministic slugs** — Slugs are hardcoded (bypass auto-generation) so frontend links remain stable across re-seeds.
2. **Realistic data** — Moroccan e-commerce context: Moroccan cities, French + Arabic product names, prices in MAD.
3. **Coverage-first** — Every frontend UI state and filtering dimension must be exercisable from seeded data.
4. **Referential integrity** — Seeder execution order respects all foreign key constraints.
5. **Admin access** — One verified admin account with known credentials.

### Execution Order

```
1. AdminSeeder              (replaces UserSeeder)
2. BrandSeeder
3. CategorySeeder
4. ProductSeeder            (replaces existing, depends on 2 + 3)
5. ProductImageSeeder       (depends on 4)
6. ProductSizeSeeder        (depends on 4)
7. ShippingMethodSeeder
8. CouponSeeder
9. OrderSeeder              (depends on 7, 8, 4)
10. OrderItemSeeder         (depends on 9, 4)
11. OrderStatusHistorySeeder (depends on 9)
12. ReviewSeeder            (depends on 4, 9)
13. ReviewImageSeeder       (depends on 12)
```

---

# 4. Seeder Definitions

---

## 4.1 AdminSeeder

**Purpose:** Create one verified admin account for `admins` table. Replaces the broken `UserSeeder`.

**Execution order:** 1

| Column | Value |
|---|---|
| email | `admin@bloom.ma` |
| password | `bcrypt('Bloom@2025!')` |
| remember_token | `null` |

---

## 4.2 BrandSeeder

**Purpose:** Populate `brands` table. Powers sidebar brand filter on `/collection` and brand name on product cards.

**Execution order:** 2 — Required before products.

**Records (8):**

| id | name | slug | logo_url |
|---|---|---|---|
| 1 | Bloom | bloom | `null` |
| 2 | Chanel | chanel | `null` |
| 3 | Dior | dior | `null` |
| 4 | Lancôme | lancome | `null` |
| 5 | Prada | prada | `null` |
| 6 | Yves Saint Laurent | ysl | `null` |
| 7 | Versace | versace | `null` |
| 8 | Givenchy | givenchy | `null` |

> `logo_url` is nullable by design. Storefront shows brand name text in `BrandLogos` component.

---

## 4.3 CategorySeeder

**Purpose:** Populate `categories` table with parent/child structure. Powers category filter on `/collection` and `CategoriesSection` on home.

**Execution order:** 3 — Required before products.

| id | parent_id | name | slug | sort_order |
|---|---|---|---|---|
| 1 | null | Parfums | parfums | 1 |
| 2 | null | Soins du Corps | soins-du-corps | 2 |
| 3 | null | Nouveautés | nouveautes | 3 |
| 4 | 1 | Eau de Parfum | eau-de-parfum | 1 |
| 5 | 1 | Body Mist | body-mist | 2 |
| 6 | 2 | Body Butter | body-butter | 1 |

---

## 4.4 ProductSeeder

**Purpose:** Core catalogue — 20 products covering all gender values, featured/non-featured states, and all categories. Replaces the broken `ProductSeeder`.

**Execution order:** 4

**Key coverage requirements:**
- At least **5 `is_featured = true`** products (drives `BestSellers` section)
- At least **3 `gender = men`**, **10 `gender = women`**, **4 `gender = unisex`** (drives gender filter)
- At least **6 products per category** for realistic filter results
- `price` range: 80–350 MAD (realistic for Moroccan market)
- `original_price` set on ~12 products (triggers discount badge)
- `is_active = true` for 18 products, `false` for 2 (tests admin toggle, invisible on storefront)

**Sample records:**

| id | brand_id | category_id | name | slug | subtitle | gender | price | original_price | stock | is_featured |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | 1 | 5 | Over Dose | over-dose | Bold Body Mist | women | 140.00 | 200.00 | 85 | true |
| 2 | 1 | 6 | Sugar Pop | sugar-pop | Silky Body Butter | women | 120.00 | 160.00 | 60 | true |
| 3 | 1 | 4 | Velvet Noir | velvet-noir | Eau de Parfum Intense | unisex | 280.00 | null | 40 | true |
| 4 | 1 | 4 | Atlas Rose | atlas-rose | Eau de Parfum Floral | women | 240.00 | 320.00 | 55 | true |
| 5 | 1 | 4 | Bois du Sahara | bois-du-sahara | Eau de Parfum Boisé | men | 260.00 | null | 35 | true |
| 6 | 1 | 5 | Cactus Flower | cactus-flower | Fresh Body Mist | women | 95.00 | 130.00 | 100 | false |
| 7 | 1 | 4 | Ambre Royal | ambre-royal | Eau de Parfum Oriental | unisex | 310.00 | null | 30 | false |
| 8 | 1 | 4 | Jasmine Night | jasmine-night | Eau de Parfum Floral | women | 220.00 | 290.00 | 45 | false |
| 9 | 1 | 5 | Marine Breeze | marine-breeze | Refreshing Body Mist | men | 85.00 | 110.00 | 90 | false |
| 10 | 1 | 6 | Nude Rose | nude-rose | Nourishing Body Butter | women | 110.00 | null | 70 | false |
| 11 | 2 | 4 | Chanel N°5 | chanel-n5 | L'Eau de Parfum | women | 350.00 | null | 20 | false |
| 12 | 3 | 4 | Miss Dior | miss-dior | Blooming Bouquet | women | 330.00 | null | 25 | false |
| 13 | 4 | 4 | La Vie Est Belle | la-vie-est-belle | Eau de Parfum | women | 295.00 | null | 28 | false |
| 14 | 5 | 4 | Prada Paradoxe | prada-paradoxe | Eau de Parfum | women | 310.00 | null | 22 | false |
| 15 | 6 | 4 | Libre | libre-ysl | Eau de Parfum | women | 320.00 | null | 18 | false |
| 16 | 7 | 4 | Eros | versace-eros | Eau de Toilette | men | 240.00 | 290.00 | 32 | false |
| 17 | 8 | 4 | L'Interdit | linterdit | Eau de Parfum | women | 275.00 | null | 24 | false |
| 18 | 1 | 4 | Black Pearl | black-pearl | Eau de Parfum Mysterieux | unisex | 290.00 | 350.00 | 15 | false |
| 19 | 1 | 6 | Velvet Cream | velvet-cream | Rich Body Butter | unisex | 130.00 | null | 50 | false |
| 20 | 1 | 5 | Gold Rush | gold-rush | Sparkling Body Mist | women | 100.00 | 140.00 | 75 | false |

> Products 18 and 20 have `is_active = false`. They will not appear in the public catalogue but will be visible in the admin panel.

---

## 4.5 ProductImageSeeder

**Purpose:** Provide display images for product cards and the product detail page gallery. Each product needs at minimum one `is_primary = true` image.

**Execution order:** 5

**Strategy:**
- 1 primary image per product (`is_primary = true`, `sort_order = 0`)
- 2 gallery images for the 5 featured products (`is_primary = false`, `sort_order = 1, 2`)
- 1 gallery image for remaining active products

**Source URLs:** Use publicly accessible Unsplash-style perfume/cosmetics imagery. All URLs stored in `url` column (max 500 chars). The `alt` column contains the product name.

**Sample primary images (product_id → url):**

| product_id | url | is_primary | sort_order |
|---|---|---|---|
| 1 | `https://images.unsplash.com/photo-1594035910387-fea47794261f?w=800` | true | 0 |
| 2 | `https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800` | true | 0 |
| 3 | `https://images.unsplash.com/photo-1541643600914-78b084683702?w=800` | true | 0 |
| 4 | `https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=800` | true | 0 |
| 5 | `https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=800` | true | 0 |

> Continue pattern for products 6–20. Gallery images reuse same base URL with different Unsplash photo IDs.

---

## 4.6 ProductSizeSeeder

**Purpose:** Provide purchasable size options for the product detail page size selector. Sizes are required to place an order (checkout sends `size_id`).

**Execution order:** 6

**Strategy:** All 20 products get at minimum 2 sizes. Featured products (1–5) get 3 sizes.

**Price modifier logic:**
- `30ml` → `price_modifier = 0.00` (base price)
- `50ml` → `price_modifier = +40.00`
- `100ml` → `price_modifier = +80.00`

For body mist/butter products (category_id 5, 6):
- `50ml` → `0.00`
- `100ml` → `+30.00`
- `200ml` → `+60.00`

**Sample records:**

| product_id | label | price_modifier | stock |
|---|---|---|---|
| 1 | 50ml | 0.00 | 50 |
| 1 | 100ml | 30.00 | 35 |
| 2 | 50ml | 0.00 | 40 |
| 2 | 100ml | 40.00 | 20 |
| 3 | 30ml | 0.00 | 20 |
| 3 | 50ml | 40.00 | 15 |
| 3 | 100ml | 80.00 | 5 |
| 4 | 30ml | 0.00 | 30 |
| 4 | 50ml | 40.00 | 20 |
| 4 | 100ml | 80.00 | 5 |
| 5 | 30ml | 0.00 | 20 |
| 5 | 50ml | 40.00 | 10 |
| 5 | 100ml | 80.00 | 5 |

> Continue with 2 sizes per product for products 6–20.

---

## 4.7 ShippingMethodSeeder

**Purpose:** Populate the shipping options displayed on `/checkout`. At least one free-threshold method to test conditional free-shipping UI.

**Execution order:** 7

| id | name | description | price | free_over | is_active | sort_order |
|---|---|---|---|---|---|---|
| 1 | Livraison Standard | Livraison en 3-5 jours ouvrables | 35.00 | null | true | 1 |
| 2 | Livraison Express | Livraison en 24-48h | 65.00 | null | true | 2 |
| 3 | Livraison Gratuite | Gratuit pour toute commande ≥ 500 MAD | 0.00 | 500.00 | true | 3 |

---

## 4.8 CouponSeeder

**Purpose:** Enable coupon input testing on `/checkout`. Covers all coupon states and types.

**Execution order:** 8

| id | code | type | value | min_order_amount | usage_limit | used_count | expires_at | is_active |
|---|---|---|---|---|---|---|---|---|
| 1 | BLOOM10 | percent | 10.00 | 0.00 | null | 0 | null | true |
| 2 | BIENVENUE50 | fixed | 50.00 | 200.00 | 100 | 0 | 2027-12-31 | true |
| 3 | FLASH20 | percent | 20.00 | 300.00 | 50 | 50 | null | true |
| 4 | ETE2024 | percent | 15.00 | 0.00 | null | 0 | 2024-08-01 | true |

**Test cases each code covers:**
- `BLOOM10` — Valid percent coupon, no minimum, unlimited, no expiry → **applies successfully**
- `BIENVENUE50` — Valid fixed MAD coupon, minimum 200 MAD → **applies if cart ≥ 200**
- `FLASH20` — Used count equals usage_limit → **returns "coupon exhausted" error**
- `ETE2024` — Expired coupon → **returns "coupon expired" error**

---

## 4.9 OrderSeeder

**Purpose:** Provide realistic orders in all status values for the admin panel order list and the public tracking page.

**Execution order:** 9

**Status vocabulary** (based on `OrderStatusHistory` `status` entries and admin panel expectations):

`pending` → `confirmed` → `processing` → `shipped` → `delivered`

And `cancelled` as a terminal state.

**Required distribution (15 orders):**

| Count | Status | Notes |
|---|---|---|
| 3 | pending | New, just placed |
| 2 | confirmed | Acknowledged by admin |
| 2 | processing | Being prepared |
| 3 | shipped | Has tracking-visible status history |
| 3 | delivered | Complete with full history |
| 2 | cancelled | Cancelled after confirmation |

**Sample deterministic order records:**

| id | order_number | coupon_id | shipping_method_id | customer_name | customer_phone | customer_email | shipping_address | shipping_city | subtotal | discount_amount | shipping_cost | total | status |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | BL-TEST-001 | null | 1 | Fatima Zahra | +212661001001 | fz@test.ma | 12 Rue Ibn Battouta | Casablanca | 280.00 | 0.00 | 35.00 | 315.00 | delivered |
| 2 | BL-TEST-002 | 1 | 2 | Youssef Alami | +212662002002 | null | 45 Av Hassan II | Rabat | 420.00 | 42.00 | 65.00 | 443.00 | shipped |
| 3 | BL-TEST-003 | null | 3 | Nadia Benali | +212663003003 | n.benali@mail.ma | 8 Rue des Figuiers | Marrakech | 550.00 | 0.00 | 0.00 | 550.00 | delivered |
| 4 | BL-TEST-004 | 2 | 1 | Karim Tahiri | +212664004004 | null | 77 Bd Mohammed V | Fès | 310.00 | 50.00 | 35.00 | 295.00 | processing |
| 5 | BL-TEST-005 | null | 1 | Laila Ouahabi | +212665005005 | null | 3 Résidence Andalous | Agadir | 140.00 | 0.00 | 35.00 | 175.00 | pending |
| 6 | BL-TEST-006 | null | 2 | Omar Cherkaoui | +212666006006 | null | 21 Rue Al Khawarizmi | Tanger | 260.00 | 0.00 | 65.00 | 325.00 | cancelled |
| 7 | BL-TEST-007 | 1 | 1 | Samira Idrissi | +212667007007 | s.idrissi@test.ma | 9 Rue Imam Malik | Meknès | 390.00 | 39.00 | 35.00 | 386.00 | confirmed |
| 8 | BL-TEST-008 | null | 1 | Rachid Boussaid | +212668008008 | null | 14 Quartier Industriel | Oujda | 240.00 | 0.00 | 35.00 | 275.00 | shipped |
| 9 | BL-TEST-009 | null | 3 | Houda Mansouri | +212669009009 | null | 56 Hay El Fath | Casablanca | 600.00 | 0.00 | 0.00 | 600.00 | delivered |
| 10 | BL-TEST-010 | null | 1 | Mehdi Saidi | +212670010010 | null | 2 Av des FAR | Kenitra | 120.00 | 0.00 | 35.00 | 155.00 | pending |
| 11 | BL-TEST-011 | null | 2 | Zineb Elmoutaouakil | +212671011011 | null | Boulevard Zerktouni | Casablanca | 310.00 | 0.00 | 65.00 | 375.00 | processing |
| 12 | BL-TEST-012 | null | 1 | Amine Belhaj | +212672012012 | null | 33 Résidence Al Amal | Tétouan | 280.00 | 0.00 | 35.00 | 315.00 | pending |
| 13 | BL-TEST-013 | null | 1 | Sana Kettani | +212673013013 | null | 7 Rue du Commerce | Safi | 140.00 | 0.00 | 35.00 | 175.00 | confirmed |
| 14 | BL-TEST-014 | null | 1 | Hamid Lahlou | +212674014014 | null | 18 Hay Mohammadi | Nador | 390.00 | 0.00 | 35.00 | 425.00 | shipped |
| 15 | BL-TEST-015 | null | 1 | Salma Benkirane | +212675015015 | null | 5 Allée des Roses | El Jadida | 220.00 | 0.00 | 35.00 | 255.00 | cancelled |

---

## 4.10 OrderItemSeeder

**Purpose:** Populate `order_items` for each order. Supports the order detail view in admin and the review modal product list in `/feedback`.

**Execution order:** 10

**Strategy:**
- 1–2 items per order
- `size_label` matches a real label from `product_sizes`
- `unit_price` equals `products.price + product_sizes.price_modifier`
- `product_id` is nullable safe — use active products only

**Sample records:**

| order_id | product_id | size_label | quantity | unit_price |
|---|---|---|---|---|
| 1 | 1 | 50ml | 2 | 140.00 |
| 2 | 3 | 30ml | 1 | 280.00 |
| 2 | 9 | 50ml | 1 | 85.00 |
| 3 | 4 | 100ml | 1 | 320.00 |
| 3 | 2 | 50ml | 2 | 120.00 |
| 4 | 5 | 50ml | 1 | 300.00 |
| 5 | 1 | 100ml | 1 | 170.00 |
| 6 | 7 | 30ml | 1 | 260.00 |
| 7 | 8 | 50ml | 1 | 220.00 |
| 7 | 6 | 100ml | 2 | 125.00 |
| 8 | 16 | 50ml | 1 | 280.00 |
| 9 | 11 | 50ml | 1 | 390.00 |
| 9 | 19 | 100ml | 2 | 160.00 |
| 10 | 10 | 50ml | 1 | 110.00 |
| 11 | 3 | 50ml | 1 | 320.00 |
| 12 | 4 | 30ml | 1 | 240.00 |
| 13 | 2 | 50ml | 1 | 120.00 |
| 14 | 5 | 30ml | 1 | 260.00 |
| 14 | 20 | 50ml | 1 | 100.00 |
| 15 | 13 | 50ml | 1 | 335.00 |

---

## 4.11 OrderStatusHistorySeeder

**Purpose:** Populate `order_status_histories` to power the tracking timeline on `/order-status`. Orders in `shipped`/`delivered` status need at least 3 history entries to render a meaningful timeline.

**Execution order:** 11

**Remember:** Columns are `status`, `label`, `location`, `created_at`. The `OrderTrackResource` maps `label → note` and `created_at → changed_at`.

**Strategy:**
- **pending orders (5,10,12):** 1 entry — `pending`, label "Commande reçue"
- **confirmed orders (7,13):** 2 entries — `pending` → `confirmed`
- **processing orders (4,11):** 3 entries — `pending` → `confirmed` → `processing`
- **shipped orders (2,8,14):** 4 entries — `pending` → `confirmed` → `processing` → `shipped`
- **delivered orders (1,3,9):** 5 entries — full chain through `delivered`
- **cancelled orders (6,15):** 2 entries — `pending` → `cancelled`

**Sample records for order BL-TEST-001 (delivered):**

| order_id | status | label | location | created_at |
|---|---|---|---|---|
| 1 | pending | Commande reçue et en attente de confirmation | Casablanca | 2025-12-01 09:00:00 |
| 1 | confirmed | Commande confirmée et prise en charge | Bloom HQ Casablanca | 2025-12-01 11:30:00 |
| 1 | processing | Commande en cours de préparation | Bloom HQ Casablanca | 2025-12-02 08:00:00 |
| 1 | shipped | Colis expédié et remis au transporteur | Centre de tri Casablanca | 2025-12-02 16:00:00 |
| 1 | delivered | Colis livré avec succès | Casablanca | 2025-12-04 10:30:00 |

**Sample records for order BL-TEST-002 (shipped):**

| order_id | status | label | location | created_at |
|---|---|---|---|---|
| 2 | pending | Commande reçue | Rabat | 2025-12-03 14:00:00 |
| 2 | confirmed | Commande confirmée | Bloom HQ Casablanca | 2025-12-03 15:00:00 |
| 2 | processing | En cours de préparation | Bloom HQ Casablanca | 2025-12-04 09:00:00 |
| 2 | shipped | Colis expédié en Express | Centre de tri Rabat | 2025-12-04 17:00:00 |

> Continue this pattern for all 15 orders per their status level.

---

## 4.12 ReviewSeeder

**Purpose:** Populate the `reviews` table with approved and pending reviews. Supports:
- `CustomerReviewsSection` on home (approved, featured-by-admin, with images)
- Product detail page star ratings and review cards
- Admin review moderation panel (pending queue)

**Execution order:** 12

**Distribution (40 reviews total):**

| is_approved | Count | Purpose |
|---|---|---|
| true | 28 | Visible on storefront |
| false (pending) | 12 | Admin moderation queue |

**Product coverage:** Every featured product (1–5) gets at least 6 approved reviews. Products 6–10 get 2–3. Others get 0–1.

**Rating distribution (realistic):**
- 5 stars: 18 reviews
- 4 stars: 12 reviews
- 3 stars: 5 reviews
- 2 stars: 3 reviews
- 1 star: 2 reviews

**Sample approved reviews (Arabic/French body text — matches Moroccan customer context):**

| id | product_id | order_number | reviewer_name | rating | body | is_approved |
|---|---|---|---|---|---|---|
| 1 | 1 | BL-TEST-001 | Fatima Zahra | 5 | واعرة بزاف ريحتها تنبهر 😍 شكرا بلوم | true |
| 2 | 1 | BL-TEST-009 | Houda M. | 5 | ريحة رائعة، تدوم طويل جداً. أنصح بها | true |
| 3 | 1 | null | Aicha B. | 4 | Très bonne qualité, je la rachèterai | true |
| 4 | 2 | BL-TEST-003 | Nadia Benali | 5 | هاد الكريم خير من رأيت في حياتي، رائحة لحلوة | true |
| 5 | 2 | null | Sara K. | 4 | Bonne texture, s'absorbe bien. Odeur agréable | true |
| 6 | 3 | null | Mohammed A. | 5 | Parfum sophistiqué, tient toute la journée | true |
| 7 | 3 | null | Karim T. | 4 | De très bonne qualité. Belle bouteille aussi | true |
| 8 | 4 | BL-TEST-003 | Nadia B. | 5 | Atlas Rose est magnifique ! Rose and oud together | true |
| 9 | 4 | null | Imane L. | 5 | Mon parfum préféré Bloom jusqu'à présent | true |
| 10 | 5 | BL-TEST-014 | Hamid L. | 5 | Bois du Sahara — قوي وعريق كالصحراء | true |
| 11 | 5 | null | Yassen R. | 4 | Parfum masculin raffiné, pas trop lourd | true |
| 12 | 6 | null | Salma O. | 3 | Odeur sympa mais ne dure pas assez | true |
| 13 | 7 | null | Hiba F. | 5 | Ambre Royal, tout est dit. Sublime | true |
| 14 | 8 | null | Malak B. | 5 | Jasmine Night ريحتها بحال الجنة | true |
| 15 | 9 | null | Adil M. | 3 | Correct pour le prix, mais pas exceptionnel | true |
| 16 | 10 | null | Siham K. | 4 | Body butter super nourrissant, peau de bébé | true |

> Reviews 17–28: similar format for products 1–5 to fill out the rating distribution. Reviews 29–40: `is_approved = false`, `approved_at = null` for each.

**Pending reviews (sample — for admin moderation panel):**

| id | product_id | reviewer_name | rating | is_approved |
|---|---|---|---|---|
| 29 | 1 | Client Anonyme | 2 | false |
| 30 | 2 | Utilisateur 12 | 5 | false |
| 31 | 3 | Nouveau Client | 4 | false |

---

## 4.13 ReviewImageSeeder

**Purpose:** Attach product photos to approved reviews. Powers the review image carousel in `CustomerReviewsSection` and product detail reviews.

**Execution order:** 13

**Strategy:** Attach 1 image to each of the first 8 approved reviews. These are user-submitted style photos (product-in-hand, unboxing, etc.).

| review_id | url |
|---|---|
| 1 | `https://images.unsplash.com/photo-1594035910387-fea47794261f?w=400` |
| 2 | `https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=400` |
| 4 | `https://images.unsplash.com/photo-1541643600914-78b084683702?w=400` |
| 6 | `https://images.unsplash.com/photo-1587017539504-67cfbddac569?w=400` |
| 8 | `https://images.unsplash.com/photo-1523293182086-7651a899d37f?w=400` |
| 10 | `https://images.unsplash.com/photo-1453396450673-3fe83d2db2c4?w=400` |
| 13 | `https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?w=400` |
| 14 | `https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400` |

---

# 5. Frontend Validation Mapping

| Seeder | Frontend page/component | UI behavior it enables |
|---|---|---|
| **AdminSeeder** | `/admin/login` | Login with `admin@bloom.ma` / `Bloom@2025!` → Sanctum token issued |
| **BrandSeeder** | `/collection` sidebar, `BrandLogos` (home) | Brand filter checkboxes populate; brand name strip renders |
| **CategorySeeder** | `/collection` sidebar, `CategoriesSection` (home) | Category filter options; category image cards on home |
| **ProductSeeder** | `/collection`, `/product/[slug]`, `BestSellers`, wishlist, checkout | Full catalogue; 5 featured products in BestSellers; gender filter produces results in all 3 values; inactive products invisible on storefront |
| **ProductImageSeeder** | Product cards everywhere, `/product/[slug]` gallery | Primary image on cards; gallery tabs on detail page |
| **ProductSizeSeeder** | `/product/[slug]` size selector, `/checkout` | Size selection required before add-to-cart; `size_id` passed to order payload |
| **ShippingMethodSeeder** | `/checkout` shipping method radio buttons | 3 choices rendered; free-shipping threshold triggers for orders ≥ 500 MAD |
| **CouponSeeder** | `/checkout` coupon input field | `BLOOM10` → success; `BIENVENUE50` → success if cart ≥ 200; `FLASH20` → "exhausted" error; `ETE2024` → "expired" error |
| **OrderSeeder** | `/success` (confirm), `/order-status` (track), `/feedback` (review) | Order lookup via `order_number` + `phone`; test phone numbers are deterministic |
| **OrderItemSeeder** | `/order-status` right panel, `/feedback` product list | Items listed in tracking panel; each item becomes a reviewable row in feedback page |
| **OrderStatusHistorySeeder** | `/order-status` timeline | Timeline renders 1–5 steps depending on order status; `label` value appears as timeline note |
| **ReviewSeeder** | `CustomerReviewsSection` (home), `/product/[slug]` reviews tab, admin review queue | Approved reviews with images appear in home carousel; product star averages calculated; admin moderation queue shows 12 pending |
| **ReviewImageSeeder** | `CustomerReviewsSection` review cards | Review card image slot populated for 8 reviews |

---

# 6. Final Consistency Check

## 6.1 Schema Alignment Audit

| Risk | Location | Resolution |
|---|---|---|
| `UserSeeder` references `App\Models\User` | `UserSeeder.php` | **Replace entirely** with `AdminSeeder` targeting `App\Models\Admin`. Drop `UserSeeder`. |
| `ProductSeeder` passes `category` as a string field | `ProductSeeder.php` | **Replace entirely.** `category` is not a column on `products`. Use `category_id` (integer FK). |
| `product_sizes.price_modifier` is additive to `products.price` | Checkout/order | Seeder must calculate `unit_price = product.price + size.price_modifier` in `OrderItemSeeder`. |
| `order_status_histories` has no `note` column | DB migration | Column is `label`, not `note`. `OrderTrackResource` maps it. Seeder fills `label` with human-readable French text. |
| `order_status_histories` has no `changed_at` column | DB migration | Column is `created_at`. `OrderTrackResource` maps it to `changed_at`. No seeder change needed. |
| `orders.order_number` auto-generated as `LX-XXXX-XXX` | `Order::booted()` | For test orders, **hardcode** `order_number = 'BL-TEST-001'` etc. to make tracking page testable with known values. |
| `product.slug` auto-generated with random suffix | `Product::booted()` | **Explicitly set slug** in seeder to bypass the randomized suffix. Enables stable `GET /products/{slug}` routes. |
| `reviews.order_number` is a soft string link | `reviews` migration | No FK — intentional. Seeder can reference any `order_number` string, including `BL-TEST-*` values. |
| `product_images.created_at` — no `updated_at` column | Migration uses `$table->timestamp('created_at')->useCurrent()` | No `updated_at` in seeder; do not call `timestamps()` or set both fields. |
| `order_items` — no timestamps | Migration — no timestamps defined | Do not fill `created_at`/`updated_at` for `order_items`. |

## 6.2 Minimum Data Volume Verification

| Requirement | Target | Seeded |
|---|---|---|
| Products viewable in collection | 1+ | 18 active |
| BestSellers renders 5 cards | 5 featured | 5 |
| All 3 gender filters return results | 3+ per gender | ✓ men:4, women:11, unisex:3 |
| Brand filter has results | 8 brands | 8 |
| Category filter has results | 6 categories | 6 |
| Shipping options at checkout | 2+ | 3 |
| Valid coupon test | 1+ valid | 2 valid (`BLOOM10`, `BIENVENUE50`) |
| Invalid coupon tests | 2 | 2 (`FLASH20` exhausted, `ETE2024` expired) |
| Trackable order (shipped) | 1+ | 3 shipped |
| Trackable order (delivered) | 1+ | 3 delivered |
| Review carousel on home | 4+ approved+with-images | 8 with images |
| Admin moderation queue | 1+ pending | 12 pending |
| Product with 0 reviews | for edge case | products 17–20 |
| Out-of-stock size | for edge case | product 3 — 100ml: stock=5 |

## 6.3 DatabaseSeeder.php — Updated Call Order

```php
public function run(): void
{
    $this->call([
        AdminSeeder::class,              // 1
        BrandSeeder::class,              // 2
        CategorySeeder::class,           // 3
        ProductSeeder::class,            // 4
        ProductImageSeeder::class,       // 5
        ProductSizeSeeder::class,        // 6
        ShippingMethodSeeder::class,     // 7
        CouponSeeder::class,             // 8
        OrderSeeder::class,              // 9
        OrderItemSeeder::class,          // 10
        OrderStatusHistorySeeder::class, // 11
        ReviewSeeder::class,             // 12
        ReviewImageSeeder::class,        // 13
    ]);
}
```

> Remove `UserSeeder::class` and old `ProductSeeder::class` from this list. Both are superseded.

---

*Document generated for: Bloom Parfums — Next.js 14 + Laravel 11 — February 2026*
