# Bug Fixes & Performance Optimizations Report

**Project:** Bloom Parfums — Laravel + Next.js  
**Date:** March 1, 2026  

---

## Table of Contents

1. [Fix 1 — Category Filter Showing 3 of 6 Categories](#fix-1)
2. [Fix 2 — Price Filter Returning Wrong Products (Race Condition)](#fix-2)
3. [Fix 3 — Product Review Submission Always Failing (422 Error)](#fix-3)
4. [Fix 4 — Performance: Redundant DB Queries & Re-fetching](#fix-4)

---

## Fix 1 — Category Filter Showing 3 of 6 Categories {#fix-1}

### Problem

The collection page sidebar filter displayed only **3 categories** despite the database containing **6**. The 3 missing categories are subcategories (children) of the top-level ones.

### Root Cause (3 layers)

| Layer | Issue |
|---|---|
| `CategoryController::index()` | `->whereNull('parent_id')` intentionally returns only 3 top-level parents |
| `CategoryResource` | Returns a nested `children` array on each parent — but... |
| `Category` TypeScript interface | Had **no `children` field** → subcategories were silently discarded by TypeScript |
| Collection page `useEffect` | Only iterated the 3 top-level items, never saw child items |

### Fix

**`frontend/services/api.ts`** — Added `children` and `parent_id` to the `Category` interface:

```typescript
// Before
export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
}

// After
export interface Category {
  id: number;
  name: string;
  slug: string;
  image_url: string | null;
  display_order: number;
  parent_id?: number | null;
  children?: Category[];          // ← added: matches CategoryResource output
}
```

**`frontend/app/collection/page.tsx`** — Flatten parents + children on load:

```typescript
// Before
categoryService.list().then(data => setCategories(data)).catch(() => {});

// After
categoryService.list().then(data => {
  const flat = [...data, ...data.flatMap(c => c.children ?? [])];
  setCategories(flat);
}).catch(() => {});
```

`CategoriesSection.tsx` (home page circles) was intentionally **not changed** — it correctly shows only the 3 top-level circles.

---

## Fix 2 — Price Filter Returning Wrong Products (Race Condition) {#fix-2}

### Problem

When dragging the price slider (e.g., min=85 → max=233), products priced **above 233 DH** (like "Velvet Noir" at 280 DH) were still appearing in the results.

### Root Cause

Every pixel of slider movement updated `selectedMax`, instantly triggering the `useEffect` that fetches products. A single drag gesture fired **50+ parallel HTTP requests** with different `price_max` values:

```
Pointer move → selectedMax=340 → API call A (max=340) ──────────────────────┐ resolves LAST
Pointer move → selectedMax=300 → API call B (max=300) ───────────┐          │
...                                                                │          │
Pointer move → selectedMax=233 → API call Z (max=233) ──┐ resolves first ✓  │
                                                          └──────────────────┘
                                     Stale call A overwrites correct result ✗
```

The backend `WHERE price <= ?` query was always correct — the bug was **100% a frontend race condition**.

### Fix

**`frontend/app/collection/page.tsx`** — Added debounce (400ms) + `AbortController`:

```typescript
// Before: fires immediately on every slider pixel
useEffect(() => {
  setLoadingProducts(true);
  productService.list(params)
    .then(({ data }) => setProducts(data))
    ...
}, [selectedMin, selectedMax, ...]);

// After: debounced + cancels stale in-flight requests
useEffect(() => {
  const controller = new AbortController();

  const timer = setTimeout(async () => {
    try {
      const result = await productService.list(params, controller.signal);
      setProducts(result.data);
    } catch (err) {
      // Ignore AbortError — it means a newer request superseded this one
      if (err instanceof Error && err.name !== 'AbortError') setProducts([]);
    }
  }, 400); // wait until drag stops

  return () => {
    clearTimeout(timer);   // cancel pending debounce
    controller.abort();    // cancel in-flight HTTP request
  };
}, [selectedMin, selectedMax, ...]);
```

**`frontend/services/api.ts`** — Added optional `signal` parameter to `productService.list`:

```typescript
// Before
list: async (params?: Record<string, unknown>) => { ... }

// After
list: async (params?: Record<string, unknown>, signal?: AbortSignal) => {
  const { data } = await apiClient.get('/v1/products', { params, signal });
  return data;
}
```

---

## Fix 3 — Product Review Submission Always Failing (422 Error) {#fix-3}

### Problem

Clicking "Publish Review" on the `/feedback` page always returned **HTTP 422 Unprocessable Entity** — all required fields (`product_id`, `reviewer_name`, `rating`) were reported as missing by Laravel, even though they were visually filled in.

### Root Cause

The `reviewService.submit()` function manually overrode the `Content-Type` header:

```typescript
// BROKEN
await apiClient.post('/v1/reviews', form, {
  headers: { 'Content-Type': 'multipart/form-data' },  // ← WRONG
});
```

**HTTP `multipart/form-data` requires a boundary token** that separates fields in the body:
```
Content-Type: multipart/form-data; boundary=----WebKitFormBoundaryXYZ123
```

Axios 1.7 **auto-generates** this boundary when it detects a `FormData` argument — but **only if you don't override the header**. By manually overriding it, the boundary was stripped:
```
Content-Type: multipart/form-data    ← no boundary = unreadable body
```

Laravel's PHP multipart parser received the raw bytes but could not locate field separators without the boundary → every required field failed validation → **100% failure rate on every submission**.

### Fix

**`frontend/services/api.ts`** — Removed the manual `Content-Type` override:

```typescript
// Before
const { data } = await apiClient.post('/v1/reviews', form, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

// After — Axios auto-sets: Content-Type: multipart/form-data; boundary=XYZ
const { data } = await apiClient.post('/v1/reviews', form);
```

**`frontend/services/api.ts`** — Fixed `OrderTrackResult` type mismatch (backend returns `{ label, location, created_at }` but interface declared `{ note, changed_at }`):

```typescript
// Before
status_histories: { status: string; note: string | null; changed_at: string }[];

// After — matches OrderTrackResource exactly
status_histories: { status: string; label: string | null; location: string | null; created_at: string }[];
```

**`backend/app/Http/Controllers/Api/V1/ReviewController.php`** — Fixed contradictory response message (`is_approved` is `true` but message said "pending approval"):

```php
// Before
'message' => 'Review submitted and pending approval.',

// After
'message' => 'Review submitted successfully.',
```

---

## Fix 4 — Performance: Redundant DB Queries & Re-fetching {#fix-4}

### Problem

Every page mount triggered fresh HTTP requests for data that never changes:

| Route | Brands request | Categories request |
|---|---|---|
| `/` (home) | `BrandLogos.tsx` → 1 DB hit | `CategoriesSection.tsx` → 1 DB hit |
| `/collection` | `collection/page.tsx` → 1 DB hit | `collection/page.tsx` → 1 DB hit |
| **Total per session** | **2 identical queries** | **2 identical queries** |

- `GET /v1/brands` = `withCount()` → SQL `JOIN + GROUP BY` — expensive, no cache
- `GET /v1/categories` = `with('children')` → 2 queries — no cache
- No global frontend state: every component had its own `useState` + `useEffect` fetch

### Fix — Backend: Server-Side Cache

**`backend/app/Http/Controllers/Api/V1/BrandController.php`:**

```php
// Before: DB hit on every request
$brands = Brand::withCount(['products' => ...])->orderBy('name')->get();

// After: cached 10 minutes
$brands = Cache::remember('api.brands', now()->addMinutes(10), function () {
    return Brand::withCount(['products' => ...])->orderBy('name')->get();
});
```

**`backend/app/Http/Controllers/Api/V1/CategoryController.php`:**

```php
// Before
$categories = Category::with('children')->whereNull('parent_id')->get();

// After
$categories = Cache::remember('api.categories', now()->addMinutes(10), function () {
    return Category::with('children')->whereNull('parent_id')->orderBy('sort_order')->get();
});
```

**`backend/app/Http/Controllers/Api/V1/Admin/BrandController.php`** + **`Admin/CategoryController.php`:**  
Added `Cache::forget()` on every admin write to prevent stale data:

```php
// On every store(), update(), destroy()
Cache::forget('api.brands');      // or 'api.categories'
```

### Fix — Frontend: Zustand Reference Store

**New file: `frontend/store/reference.ts`**

```typescript
// Single store, fetched once, reused by all components
const useReferenceStore = create<ReferenceStore>((set, get) => ({
  brands: [],
  brandsReady: false,

  ensureBrands: () => {
    if (get().brandsReady || get().brandsLoading) return; // ← idempotent guard
    brandService.list().then(data => set({ brands: data, brandsReady: true }));
  },

  categories: [],         // flat list (parents + children) for collection filter
  topLevelCategories: [], // parents only for home page circles

  ensureCategories: () => {
    if (get().categoriesReady || get().categoriesLoading) return;
    categoryService.list().then(data => {
      const flat = [...data, ...data.flatMap(c => c.children ?? [])];
      set({ categories: flat, topLevelCategories: data, categoriesReady: true });
    });
  },
}));
```

**`frontend/components/sections/BrandLogos.tsx`**, **`CategoriesSection.tsx`**, **`collection/page.tsx`:**

```typescript
// Before — each component fetches independently
const [brands, setBrands] = useState<Brand[]>([]);
useEffect(() => { brandService.list().then(setBrands); }, []);

// After — tap into the shared store
const brands = useReferenceStore((s) => s.brands);
const ensureBrands = useReferenceStore((s) => s.ensureBrands);
useEffect(() => { ensureBrands(); }, [ensureBrands]); // no-op if already loaded
```

### Performance Result

```
Before — Browser session (HOME → /collection):
  GET /v1/brands      ← BrandLogos.tsx        (DB: expensive withCount JOIN)
  GET /v1/categories  ← CategoriesSection.tsx (DB: 2 queries)
  GET /v1/brands      ← collection/page.tsx   (same DB query again)
  GET /v1/categories  ← collection/page.tsx   (same DB query again)
  → 4 HTTP requests, 6 DB queries

After — Browser session (HOME → /collection):
  GET /v1/brands      ← first consumer (served from file cache after 1st ever hit)
  GET /v1/categories  ← first consumer (served from file cache after 1st ever hit)
  → navigation to /collection: 0 new requests (store guard blocks)
  → 2 HTTP requests, ≤2 DB queries (0 after first 10-min window)
```

---

## Files Modified

| File | Type | Change |
|---|---|---|
| `frontend/services/api.ts` | Frontend | Added `children?` to `Category` interface; fixed `OrderTrackResult` types; removed manual `Content-Type` header from review submit; added `signal` to `product.list` |
| `frontend/app/collection/page.tsx` | Frontend | Category flatten on load; debounced product fetch with AbortController; replaced local brand/category state with reference store |
| `frontend/components/sections/BrandLogos.tsx` | Frontend | Replaced local fetch with reference store |
| `frontend/components/CategoriesSection.tsx` | Frontend | Replaced local fetch with reference store |
| `frontend/store/reference.ts` | Frontend | **New file** — Zustand store for brands + categories |
| `backend/app/Http/Controllers/Api/V1/BrandController.php` | Backend | Added `Cache::remember('api.brands', 10 min)` |
| `backend/app/Http/Controllers/Api/V1/CategoryController.php` | Backend | Added `Cache::remember('api.categories', 10 min)` |
| `backend/app/Http/Controllers/Api/V1/Admin/BrandController.php` | Backend | Added `Cache::forget('api.brands')` on all write operations |
| `backend/app/Http/Controllers/Api/V1/Admin/CategoryController.php` | Backend | Added `Cache::forget('api.categories')` on all write operations |
| `backend/app/Http/Controllers/Api/V1/ReviewController.php` | Backend | Fixed response message accuracy |
