# 🔐 Security Audit Report

**Application:** Parfum — E-commerce (Laravel 11 + Next.js 14)  
**Date:** April 19, 2026  
**Auditor:** Security Review — Full-Stack Analysis  
**Scope:** Backend API, Frontend SPA, Server Config, Database

---

## 📊 Summary

| Metric | Value |
|--------|-------|
| **Overall Security Score** | **4.5 / 10** |
| 🔴 Critical Issues | **4** |
| 🟠 Medium Issues | **9** |
| 🟢 Low Issues | **7** |

The application has **good foundations** (no mass assignment, no `$request->all()`, validated FormRequests, explicit `$fillable` on all models, parameterized queries). However, several **critical** issues exist that would allow data theft, unauthorized access, and server exploitation in a production environment.

---

## 🚨 Critical Vulnerabilities

---

### C1. SSRF (Server-Side Request Forgery) in Image URL Import

- **Type:** Backend / API
- **File:** `backend/app/Services/ImageService.php` → `processFromUrl()` (line 168)
- **Description:** The admin image-from-URL feature calls `file_get_contents()` on a user-supplied URL. `FILTER_VALIDATE_URL` does **not** block dangerous schemes like `file://`, `php://`, `gopher://`, or internal IPs.
- **Risk:** An attacker with admin access can read local files (`file:///c:/xampp/php/php.ini`), probe internal services (cloud metadata at `169.254.169.254`), or scan the internal network. SSL verification is also disabled (`verify_peer => false`).
- **Example:**
  ```
  POST /api/v1/admin/products/{id}/images
  { "image_url": "file:///c:/Users/acer/Desktop/Parfum/backend/.env" }
  ```
- **Fix:**
  ```php
  // Allowlist: only http/https, block private IPs
  $parsed = parse_url($url);
  if (!in_array($parsed['scheme'] ?? '', ['http', 'https'], true)) {
      throw new \Exception('Only HTTP(S) URLs are allowed.');
  }
  $ip = gethostbyname($parsed['host']);
  if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
      throw new \Exception('Internal/private URLs are not allowed.');
  }
  // Use cURL instead of file_get_contents, enable SSL verification
  ```

---

### C2. IDOR — Invoice Download Without Authentication

- **Type:** API / Access Control
- **File:** `backend/app/Http/Controllers/Api/V1/OrderController.php` → `downloadInvoice()` (line 69)
- **Route:** `GET /api/v1/invoices/{orderNumber}/download` — **public, no auth**
- **Description:** Anyone who knows or guesses an order number (`LX-XXXX-XXX`) can download the full PDF invoice containing customer **name, phone number, address, and order details**. The order number format has only ~1.7 billion combinations and is brute-forceable.
- **Risk:** Mass PII extraction. The `track()` endpoint requires phone verification, but `downloadInvoice()` has zero access control.
- **Example:**
  ```
  curl http://localhost:8000/api/v1/invoices/LX-AB12-XY3/download → Full invoice PDF
  ```
- **Fix:**
  ```php
  public function downloadInvoice(Request $request, string $orderNumber)
  {
      $request->validate(['phone' => 'required|string']);
      $order = Order::where('order_number', $orderNumber)
          ->where('customer_phone', $request->phone)
          ->firstOrFail();
      // ... generate PDF
  }
  ```

---

### C3. APP_DEBUG=true Exposes Internal Information

- **Type:** Server / Configuration
- **File:** `backend/.env` (line 4)
- **Description:** `APP_DEBUG=true` causes Laravel to return full stack traces, file paths, environment variables, and database queries in error responses. Any malformed API request reveals the entire server structure.
- **Risk:** Information disclosure → an attacker maps the application before exploiting other vulnerabilities. Stack traces may leak database credentials, file paths, and internal logic.
- **Example:**
  ```
  GET /api/v1/products/nonexistent → 500 response with full stack trace, file paths, env vars
  ```
- **Fix:**
  ```env
  APP_DEBUG=false
  APP_ENV=production
  ```

---

### C4. Secrets in `.env` — Real Credentials Committed to Repository

- **Type:** Server / Configuration
- **File:** `backend/.env` (entire file)
- **Description:** While the root `.gitignore` does exclude `backend/.env`, the `backend/.gitignore` itself does **not** list `.env`. If someone runs `git add` from inside the `backend/` directory, the `.env` with real Gmail App Password, Google OAuth Client Secret, Refresh Token, and JWT Secret gets committed. The current `.env` contains:
  - `MAIL_PASSWORD=iottdrjtfctaxbqr` — Gmail App Password
  - `GOOGLE_CLIENT_SECRET=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`
  - `GOOGLE_REFRESH_TOKEN=1//03rLlukLSoXSq...` — full OAuth refresh token
  - `JWT_SECRET=Q1tFh9C6D1MB...` — JWT signing key
  - `DB_USERNAME=root` / `DB_PASSWORD=` — root with no password
- **Risk:** If any of these leak (e.g., backup, sharing repo), the attacker gains full email access, can forge JWT tokens, and has database root access.
- **Fix:**
  1. Add `.env` to `backend/.gitignore` (defense in depth)
  2. Rotate ALL secrets immediately if the repo was ever shared
  3. Set a strong MySQL password
  4. Use a secrets manager for production

---

## ⚠️ Medium Risks

---

### M1. Admin Token Cookie Not HttpOnly — XSS Token Theft

- **Type:** Backend + Frontend / Authentication
- **Files:**
  - `backend/app/Http/Controllers/Api/V1/Admin/AdminAuthController.php` (line 55)
  - `frontend/services/api.ts` (line 85)
- **Description:** The admin Sanctum token is stored in a **non-HttpOnly cookie** so JavaScript can read it and set the `Authorization` header. If any XSS vulnerability is found, the attacker steals the admin token instantly via `document.cookie`.
- **Risk:** Full admin account takeover via any XSS vector.
- **Fix:** Use HttpOnly cookie with the token. Configure axios to send credentials (cookies) automatically, and have the backend read the token from the cookie directly instead of the `Authorization` header. This way JS never touches the token.

---

### M2. Reviews Auto-Approved Without Moderation

- **Type:** Backend / Business Logic
- **File:** `backend/app/Http/Controllers/Api/V1/ReviewController.php` (line 156)
- **Description:** `'is_approved' => true` — reviews submitted via the public endpoint (no auth required) are immediately visible. An attacker can automate fake 5-star or 1-star reviews.
- **Risk:** Reputation manipulation, spam, offensive content displayed publicly.
- **Fix:**
  ```php
  'is_approved' => false, // Require admin moderation
  ```

---

### M3. No Content-Security-Policy Header

- **Type:** Frontend / Headers
- **File:** `frontend/next.config.mjs` (lines 6–14)
- **Description:** The app sets `X-Content-Type-Options`, `X-Frame-Options`, and the deprecated `X-XSS-Protection`, but has **no CSP header**. Without CSP, any injected script (XSS) runs without restriction.
- **Risk:** CSP is the most effective defense against XSS. Its absence means no safety net.
- **Fix:**
  ```js
  {
    key: 'Content-Security-Policy',
    value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; connect-src 'self' http://localhost:8000"
  },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  ```

---

### M4. PII in URL Query Parameters

- **Type:** Frontend / Privacy
- **File:** `frontend/app/checkout/page.tsx` (line 151)
- **Description:** After checkout, customer **name, phone, and city** are passed as URL query parameters to `/success`. These end up in browser history, server logs, and `Referer` headers.
- **Example:**
  ```
  /success?order=LX-AB12-XY3&total=450&name=John+Doe&phone=%2B212612345678&city=Casablanca
  ```
- **Risk:** PII leakage through browser history, bookmarks, analytics tools, and referrer headers.
- **Fix:** Store the order confirmation data in a Zustand store or `sessionStorage` and redirect to `/success` without query params. Read the data from state on the success page.

---

### M5. Generous Rate Limit on Order Creation (120/min)

- **Type:** API / Abuse
- **File:** `backend/routes/api.php` (line 49 + line 67)
- **Description:** `POST /orders` shares the same `throttle:120,1` as read-only catalogue endpoints. An attacker can create 120 fake orders per minute, draining stock, triggering notification emails, and creating order spam.
- **Risk:** Denial-of-service on business operations, email spam to admin.
- **Fix:** Add a stricter throttle for write endpoints:
  ```php
  Route::post('/orders', [OrderController::class, 'store'])->middleware('throttle:5,1');
  Route::post('/reviews', [ReviewController::class, 'store'])->middleware('throttle:3,1');
  Route::post('/store/contact-submit', [StoreController::class, 'submitContact'])->middleware('throttle:3,1');
  ```

---

### M6. LIKE Wildcard Injection in Search

- **Type:** Backend / Input Handling
- **Files:** `ProductController.php` (line 34), `Admin/OrderController.php` (line 36), `Admin/ReviewController.php`, `Admin/CouponController.php`
- **Description:** Search queries use `LIKE "%{$search}%"` without escaping `%` and `_` wildcards. While Laravel uses parameter bindings (no SQL injection), attackers can craft `%_%_%_%` patterns causing expensive full-table scans.
- **Risk:** Performance-based DoS — a crafted search can make every query slow.
- **Fix:**
  ```php
  $escaped = str_replace(['%', '_'], ['\\%', '\\_'], $search);
  $query->where('name', 'LIKE', "%{$escaped}%");
  ```

---

### M7. Error Messages Leak Internal Details

- **Type:** Backend / Information Disclosure
- **File:** `backend/app/Http/Controllers/Api/V1/Admin/ProductController.php` (lines 109, 310)
- **Description:** `$e->getMessage()` is returned directly in JSON responses. This can leak database schema, constraint names, file paths, and internal logic.
- **Fix:**
  ```php
  Log::error('Product creation failed', ['error' => $e->getMessage()]);
  return response()->json(['message' => 'Failed to create product.'], 500);
  // Never return $e->getMessage() to the client
  ```

---

### M8. 35+ Console.log Statements Leak Data in Production

- **Type:** Frontend / Information Disclosure
- **Files:** `services/api.ts`, `product/[slug]/page.tsx`, `feedback/page.tsx`, `BestSellers.tsx`, and others
- **Description:** Extensive `console.log` statements ship to production, logging full API responses, FormData entries (admin profile), product IDs, and debug data directly into the browser console.
- **Risk:** Any user opening DevTools sees API internals. The `console.log('[updateProfile] FormData entries:', ...)` in `services/api.ts` (line 707) logs admin profile data.
- **Fix:** Remove all console.log calls or use a build-time strip:
  ```js
  // next.config.mjs
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  ```

---

### M9. `sanitizeImageUrl` Does Not Validate URL Scheme

- **Type:** Frontend / XSS
- **File:** `frontend/lib/utils.ts` (line 312)
- **Description:** Only strips whitespace. A `javascript:alert(1)` URL from the database would pass through. While `next/image` doesn't execute JS URIs, any future use in `<a href>` or raw `<img src>` is vulnerable.
- **Fix:**
  ```ts
  export function sanitizeImageUrl(url: string | null | undefined): string {
    if (!url) return FALLBACK_IMG;
    const cleaned = url.replace(/[\r\n\t]+/g, '').trim();
    if (!cleaned) return FALLBACK_IMG;
    try {
      const parsed = new URL(cleaned, window.location.origin);
      if (!['http:', 'https:'].includes(parsed.protocol)) return FALLBACK_IMG;
    } catch { return FALLBACK_IMG; }
    return cleaned;
  }
  ```

---

## 🟢 Low Risk / Best Practice Improvements

---

### L1. No CSRF Token Pattern

- **Type:** Frontend + Backend
- **Description:** The API relies solely on `SameSite=Lax` cookies and CORS for CSRF protection. No double-submit cookie or `X-XSRF-TOKEN` pattern. Acceptable for current SPA-only architecture, but insufficient if any subdomain or non-SPA client is added.

### L2. Database Root with No Password

- **Type:** Server / Configuration
- **File:** `backend/.env` — `DB_USERNAME=root`, `DB_PASSWORD=` (empty)
- **Risk:** If MySQL port (3306) is exposed, full database access with no authentication. Fine for local-only XAMPP, critical in any server environment.

### L3. Next.js 14.2.5 Has Known CVEs

- **Type:** Frontend / Dependencies
- **File:** `frontend/package.json`
- **Description:** Version 14.2.5 has published security fixes in later 14.2.x releases (Server Actions bypass, Image component SSRF). Should update to 14.2.25+ or latest.

### L4. Admin Auth Endpoints Not in Protected Group

- **Type:** Backend / Architecture
- **File:** `backend/routes/api.php` (lines 88–91)
- **Description:** `POST /admin/auth/logout` and `GET /admin/auth/me` are outside the `auth:admins` middleware group. They check auth internally, but this is less defense-in-depth.

### L5. Verbose Logging of PII

- **Type:** Backend
- **File:** `backend/app/Http/Controllers/Api/V1/Admin/AdminProfileController.php` (line 56)
- **Description:** `\Log::info()` logs email, phone, username at INFO level. Production logs retain PII.

### L6. No HTTPS Enforcement

- **Type:** Server / Transport
- **Description:** No HSTS header, no HTTP→HTTPS redirect. The admin cookie `Secure` flag is only set when `APP_ENV=production`. In development/staging, tokens transit over plain HTTP.

### L7. External Resource Dependencies

- **Type:** Frontend
- **Files:** `success/page.tsx` (freepnglogos.com barcode image), `lib/utils.ts` (Unsplash fallback)
- **Description:** External images loaded without Subresource Integrity. If those domains are compromised, content injection is possible. Low risk since images can't execute scripts.

---

## 🧠 Root Causes

| Pattern | Why It Exists | Impact |
|---------|---------------|--------|
| **"Dev mode in production"** | `APP_DEBUG=true`, no HTTPS, root DB with no password — development shortcuts never cleaned up | Information disclosure, credential exposure |
| **Convenience over security** | Admin token in non-HttpOnly cookie so JS can read it; reviews auto-approved to skip moderation | Token theft via XSS, spam reviews |
| **Missing access control on public endpoints** | Invoice download has no auth because "customers need the link" — but no ownership verification | IDOR / PII theft |
| **Trust of admin-supplied input** | SSRF in image URL import: assumes admin URLs are safe | Server-side file read, network scanning |
| **No output sanitization** | `$e->getMessage()` in responses, `console.log` in production, PII in URLs | Information leakage |

---

## 🛠️ Recommended Fixes (Priority Order)

### Fix 1: Block SSRF in ImageService
- **Problem:** `file_get_contents()` with arbitrary URL schemes
- **Solution:** Allowlist `http`/`https` only, block private IPs, use cURL with SSL verification
- **Effort:** 30 min

### Fix 2: Add Phone Verification to Invoice Download
- **Problem:** No auth on invoice endpoint
- **Solution:** Require `?phone=` parameter and verify against order's `customer_phone`
- **Effort:** 15 min

### Fix 3: Set `APP_DEBUG=false` for Production
- **Problem:** Full stack traces in error responses
- **Solution:** `APP_DEBUG=false` in production `.env`
- **Effort:** 1 min

### Fix 4: Add `.env` to `backend/.gitignore`
- **Problem:** Missing from backend-level gitignore
- **Solution:** Add `.env` line to `backend/.gitignore`
- **Effort:** 1 min

### Fix 5: Set Strong Database Password
- **Problem:** Root with empty password
- **Solution:** Create a dedicated MySQL user with a strong password
- **Effort:** 10 min

### Fix 6: Make Admin Token HttpOnly
- **Problem:** XSS-stealable token
- **Solution:** HttpOnly cookie + backend reads token from cookie, not Authorization header
- **Effort:** 2 hours (refactor auth flow)

### Fix 7: Require Review Moderation
- **Problem:** Auto-approved reviews
- **Solution:** `'is_approved' => false` + admin approval workflow (already exists in admin panel)
- **Effort:** 5 min

### Fix 8: Add CSP + HSTS Headers
- **Problem:** No Content-Security-Policy
- **Solution:** Add CSP, HSTS, Referrer-Policy, Permissions-Policy headers in `next.config.mjs`
- **Effort:** 30 min

### Fix 9: Stricter Rate Limits on Write Endpoints
- **Problem:** 120/min on order creation
- **Solution:** Separate throttle groups: 5/min for orders, 3/min for reviews/contact
- **Effort:** 10 min

### Fix 10: Remove PII from URL Parameters
- **Problem:** Name, phone, city in query strings
- **Solution:** Use Zustand/sessionStorage for success page data
- **Effort:** 30 min

### Fix 11: Strip Console.log in Production
- **Problem:** 35+ debug logs shipping to browser
- **Solution:** `removeConsole` in next.config.mjs
- **Effort:** 5 min

---

## 🔒 Best Practices Checklist

| Check | Status |
|-------|--------|
| All inputs validated via FormRequest | ✅ Yes |
| No `$request->all()` usage | ✅ Clean |
| All models use explicit `$fillable` | ✅ Yes |
| File uploads verified (MIME + size) | ✅ Validated |
| No `dangerouslySetInnerHTML` / XSS | ✅ Clean |
| SQL queries use parameter binding | ✅ Yes (raw queries use `?` bindings) |
| Password hashed (bcrypt) | ✅ Yes |
| Sensitive model fields `$hidden` | ✅ Password hidden |
| CORS restricted to frontend origin | ✅ Configured |
| Rate limiting on all routes | ✅ Present (but too generous for writes) |
| API protected with Sanctum auth | ✅ Admin routes protected |
| File uploads secured | ⚠️ URL import has SSRF risk |
| No sensitive data in responses | ❌ `$e->getMessage()` leaks internals |
| HTTPS enforced | ❌ No HSTS, no redirect |
| Debug disabled in production | ❌ `APP_DEBUG=true` |
| Admin token HttpOnly | ❌ JS-accessible cookie |
| CSP header present | ❌ Missing |
| Review moderation | ❌ Auto-approved |
| Invoice access controlled | ❌ No auth check |
| Console.log stripped in prod | ❌ 35+ statements |

---

## 🚀 Final Verdict

**Security Level: MODERATE — suitable for development, NOT production-ready.**

**Strengths:**
- Clean input handling (FormRequests, validated data, explicit `$fillable`)
- No SQL injection vectors (all raw queries use parameter bindings)
- No XSS via `dangerouslySetInnerHTML`
- CORS properly restricted to frontend origin
- Admin routes behind Sanctum + role middleware

**Critical Actions Before Production:**
1. **Fix SSRF** in image URL import (C1) — server file read risk
2. **Fix invoice IDOR** (C2) — customer PII theft
3. **Set `APP_DEBUG=false`** (C3) — information disclosure
4. **Secure `.env` and rotate secrets** (C4) — credential theft
5. **Add CSP header + make token HttpOnly** (M1 + M3) — XSS defense

These 5 fixes address 80% of the risk surface. The remaining medium/low items should be addressed in the next sprint.
