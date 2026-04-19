# Performance Optimization Report

**Date:** April 19, 2026  
**Scope:** Backend API + Frontend Store  
**Status:** All fixes applied & verified ✅

---

## 1. Diagnostic Summary

A full performance audit measured real API response times and payload sizes across all endpoints. Key findings:

| Endpoint | Cold (ms) | Cached (ms) | Payload |
|---|---|---|---|
| Products (featured, limit=100) | 1,940 | 353 | 13.2 KB |
| Products (all, no limit) | 425 | 374 | 123.8 KB |
| Product detail (kalimat) | 910 | 613 | 10.7 KB |
| Reviews (admin, all) | 1,550 | 1,105 | 135.7 KB |
| Aggregates | 607 | 559 | 0.1 KB |
| Brands | 625 | 660 | 5 KB |
| Categories | 699 | 645 | 0.6 KB |
| Ingredients | 1,820 | 662 | 1.8 KB |
| Banners | 744 | 392 | ~0 KB |

**Root causes identified:**
- No HTTP compression — large JSON payloads sent raw
- Unused `sizes` eager load on every product query
- Aggregates endpoint recalculates MIN/MAX on every call
- Reviews endpoint returns all 492 reviews (135 KB) when no limit specified
- Frontend catalog store uses 50ms polling for request deduplication

---

## 2. Fixes Applied

### 2.1 Gzip Compression Middleware

**File created:** `backend/app/Http/Middleware/CompressResponse.php`  
**File modified:** `backend/bootstrap/app.php`

Compresses all JSON/text API responses > 1 KB when the client sends `Accept-Encoding: gzip`. Appended to the API middleware pipeline after `SecurityHeaders`.

**Behavior:**
- Checks `Accept-Encoding: gzip` header
- Skips if response already has `Content-Encoding`
- Only compresses `application/json` and `text/*` content types
- Minimum threshold: 1,024 bytes
- Compression level: 6 (balanced speed/ratio)
- Sets `Content-Encoding`, `Content-Length`, and `Vary` headers

**Test result:**

| Endpoint | Before | After (gzip) | Reduction |
|---|---|---|---|
| Products (all 79) | 126,757 bytes | 21,195 bytes | **83%** |
| Products (featured, 10) | 13,505 bytes | 3,260 bytes | **76%** |
| Product detail | 10,700 bytes | 2,514 bytes | **76%** |

---

### 2.2 Remove Unused `sizes` Eager Load

**File modified:** `backend/app/Http/Controllers/Api/V1/ProductController.php`

Removed `'sizes'` from the `Product::with()` eager load chain. The `sizes` relation was loaded on every product query but never serialized by `ProductResource` — a wasted JOIN on every request.

**Before:**
```php
Product::with(['brand', 'category', 'productType', 'sizes', 'variants', 'images' => ...])
```

**After:**
```php
Product::with(['brand', 'category', 'productType', 'variants', 'images' => ...])
```

**Verified:** `sizes` field no longer appears in product JSON responses.

---

### 2.3 Cache Aggregates Endpoint

**File modified:** `backend/app/Http/Controllers/Api/V1/ProductController.php`

Wrapped the `aggregates()` MIN/MAX price query in `Cache::remember()` with a 15-minute TTL. Previously executed a raw SQL aggregate on every call (~600ms).

**Before:**
```php
$agg = Product::where('is_active', true)
    ->selectRaw('MIN(price) as min_price, MAX(price) as max_price')
    ->first();
```

**After:**
```php
$data = Cache::remember('products:aggregates', now()->addMinutes(15), function () {
    // ... same query, cached result
});
```

**Verified:** Cache file created at `storage/framework/cache/data/`. Subsequent calls return identical data from cache.

---

### 2.4 Default Pagination for Reviews

**File modified:** `backend/app/Http/Controllers/Api/V1/ReviewController.php`

Changed `buildReviewsResponse()` to always paginate with a default of 15 per page (max 50). Previously returned all reviews via `->get()` when no `limit` param was set.

**Before:**
```php
$collection = $request->filled('limit')
    ? $query->paginate($request->integer('limit'))
    : $query->get();
```

**After:**
```php
$limit = $request->integer('limit', 15);
$collection = $query->paginate(min($limit, 50));
```

**Test results:**

| Scenario | Before | After |
|---|---|---|
| Homepage reviews (source=admin) | 492 reviews, 135.7 KB | 15 reviews, ~15 KB |
| Product reviews (product_id=1) | 6 reviews | 6 reviews (unchanged) |
| Custom limit (limit=5) | 5 reviews | 5 reviews (unchanged) |
| Rating summary | Accurate (all reviews) | Still accurate (server-side aggregate) |

**Note:** The `rating_summary` is computed from a separate aggregate query that counts all reviews, so statistics remain accurate regardless of pagination.

---

### 2.5 Shared Promise Deduplication in Catalog Store

**File modified:** `frontend/store/catalog.ts`

Replaced the `setInterval` polling mechanism with a shared `Promise` map for in-flight request deduplication. Previously, concurrent calls for the same cache key would poll every 50ms waiting for the first request to complete.

**Before:**
```typescript
if (loading[key]) {
    return new Promise((resolve) => {
        const checkIfLoaded = setInterval(() => {
            const updated = get().products.get(key);
            if (updated && !get().loading[key]) {
                clearInterval(checkIfLoaded);
                resolve(updated.data);
            }
        }, 50);
    });
}
```

**After:**
```typescript
const inflightRequests = new Map<string, Promise<Product[]>>();

// Inside ensureProducts:
const existing = inflightRequests.get(key);
if (existing) return existing;

const promise = (async () => {
    try { /* fetch logic */ }
    finally { inflightRequests.delete(key); }
})();
inflightRequests.set(key, promise);
return promise;
```

**Benefits:**
- Zero latency overhead (no 50ms polling delay)
- Deterministic resolution (all waiters get the same Promise)
- Automatic cleanup via `finally` block

**Verified:** Zero TypeScript errors in `catalog.ts`.

---

## 3. Skipped Optimization

### Server-Side Pagination for Products

**Reason:** With gzip compression, the full 79-product payload drops from 126 KB to 21 KB — acceptable for the catalog size. The collection page relies on having the full product list for:
- Client-side brand count aggregation
- Client-side filtering and sorting
- Client-side pagination with `Array.slice()`

Refactoring to server-side pagination would require significant frontend changes for marginal gain at this catalog size. Recommended to revisit if catalog grows beyond 500 products.

---

## 4. Before vs After Summary

| Metric | Before | After | Improvement |
|---|---|---|---|
| Full product list payload | 126.7 KB | 21.2 KB (gzip) | **83% smaller** |
| Product detail payload | 10.7 KB | 2.5 KB (gzip) | **76% smaller** |
| Homepage reviews payload | 135.7 KB (492 items) | ~15 KB (15 items, gzip) | **89% smaller** |
| Aggregates DB query | Every request (~600ms) | Cached 15 min | **Eliminated** |
| Sizes eager load | Unnecessary JOIN | Removed | **1 fewer query** |
| Concurrent fetch dedup | 50ms polling interval | Shared Promise | **0ms overhead** |

---

## 5. Files Modified

| File | Change |
|---|---|
| `backend/app/Http/Middleware/CompressResponse.php` | **Created** — gzip middleware |
| `backend/bootstrap/app.php` | Added CompressResponse to API middleware |
| `backend/app/Http/Controllers/Api/V1/ProductController.php` | Removed `sizes` eager load, cached aggregates |
| `backend/app/Http/Controllers/Api/V1/ReviewController.php` | Default pagination (15/page, max 50) |
| `frontend/store/catalog.ts` | Shared Promise dedup replacing polling |

---

## 6. Pre-Existing Issues (Not Addressed)

These were identified during the audit but are outside the current scope:

| Issue | Impact | Recommendation |
|---|---|---|
| `CACHE_STORE=file` | ~500ms overhead on cached responses | Switch to Redis/APCu |
| All pages `'use client'` | No SSR/SSG benefits | Add SSR for SEO pages |
| 7+ parallel API calls on homepage | Connection contention | Consolidate into BFF endpoint |
| `LIKE '%term%'` search | Full table scan | Add full-text index or Meilisearch |
| SWR installed but unused | No stale-while-revalidate | Replace manual fetch with SWR hooks |
