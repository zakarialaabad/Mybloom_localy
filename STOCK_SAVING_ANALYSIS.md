# DEEP ANALYSIS: Why Stock Saves as 0 in Dashboard

## Problem Statement
Stock values are not being saved correctly when creating/editing products with size variants. The dashboard always shows stock = 0 even when variants have stock values entered.

## Investigation Results

### Layer 1: Frontend (Add/Edit Pages)
**Status: ✅ CORRECT** 
- Frontend correctly sends stock for each variant
- Both add/page.tsx and edit/page.tsx have the correct default variant selection logic
- Stock is included in the FormData: 
  ```typescript
  // Lines 395-403 add/page.tsx
  const sorted = [...validVariants].sort((a, b) => Number(a.size) - Number(b.size));
  const defaultV = sorted.length === 1 ? sorted[0] : sorted[1];
  data.append('price', defaultV.price);
  data.append('stock', defaultV.stock);  // ✅ Stock IS being sent
  ```
- Each variant object has: `{size, unit, price, promotion, stock}`
- Variants JSON is sent as: `data.append('variants', JSON.stringify(validVariants));`

### Layer 2: Backend Request Validation 
**Status: ❌ CRITICAL BUG FOUND**

**File:** `backend/app/Http/Requests/Admin/StoreProductRequest.php` (Lines 21-53)
**File:** `backend/app/Http/Requests/Admin/UpdateProductRequest.php` (Lines 21-56)

**Problem:** Missing validation rules for variant stock

Current validation rules:
```php
'variants_array.*.size'                => ['required', 'numeric', 'min:1', 'distinct'],
'variants_array.*.price'               => ['required', 'numeric', 'min:0'],
'variants_array.*.promotion_percent'   => ['nullable', 'numeric', 'min:0', 'max:100'],
'variants_array.*.promotion'           => ['nullable', 'numeric', 'min:0', 'max:100'],
// ❌ MISSING: 'variants_array.*.stock' validation rule
```

**Why This Breaks Everything:**
1. Laravel's request validation uses a WHITELIST approach
2. Only fields with validation rules are included in `$request->validated()`
3. Fields without rules are **SILENTLY DROPPED** by Laravel
4. When frontend sends: `{size: 50, price: 100, promotion: 0, stock: 50}`
5. After validation, only `{size: 50, price: 100, promotion: 0}` reaches the controller
6. The `stock` field is completely removed

### Layer 3: Backend Controller
**File:** `backend/app/Http/Controllers/Api/V1/Admin/ProductController.php`

The controller calls VariantService correctly (Line 68):
```php
$variantService->syncVariants($product, $validated['variants_array']);
```

But `$validated['variants_array']` is missing the stock field because of Layer 2 bug.

### Layer 4: VariantService
**File:** `backend/app/Services/VariantService.php` (Lines 52-74)

VariantService tries to read stock (Line 52):
```php
'stock_quantity' => (int) ($variantData['stock'] ?? $variantData['stock_quantity'] ?? 0),
```

Since `$variantData` never contains `'stock'` (stripped by validation), it falls back to default `0`.

Then it attempts to update products.stock (Lines 66-74):
```php
if ($promoPercent > 0) {
    $product->update([
        'price'          => $finalPrice,
        'original_price' => $basePrice,
        'stock'          => $stock,  // ← Always 0 here
    ]);
}
```

### Dashboard Display
**File:** `frontend/app/admin/dashboard/products/page.tsx`

The dashboard displays stock correctly FROM the database:
```typescript
const { text, cls } = stockLabel(product.stock);
```

Since products.stock is 0, the dashboard shows 0. This is working as designed; the problem is the data.

---

## ROOT CAUSE SUMMARY

| Layer | Component | Issue | Impact |
|:---:|:---|:---|:---|
| 1 | Frontend | ✅ Sends stock correctly | - |
| 2 | **Validation Request** | ❌ **No rule for `variants_array.*.stock`** | **Stock dropped before controller** |
| 3 | Controller | Works with received data | Receives incomplete data |
| 4 | VariantService | Uses default 0 | Results in products.stock = 0 |
| 5 | Dashboard | Displays products.stock | Shows 0 (correctly displays bad data) |

---

## THE FIX

Add the missing validation rule to both request files:

### File: `backend/app/Http/Requests/Admin/StoreProductRequest.php`
Add line after line 48:
```php
'variants_array.*.stock'               => ['nullable', 'integer', 'min:0'],
```

### File: `backend/app/Http/Requests/Admin/UpdateProductRequest.php`  
Add line after line 49:
```php
'variants_array.*.stock'               => ['nullable', 'integer', 'min:0'],
```

**Effect:** 
- Stock field will be included in `$validated['variants_array']`
- VariantService will receive stock for each variant
- Products.stock will be correctly updated with default variant's stock
- Dashboard will display the correct stock value

---

## Current System Flow (After Fix)

1. **Frontend sends:** `{size: 50, price: 100, stock: 50, promotion: 0}`
2. **Validation accepts:** All fields including stock ✅
3. **Controller passes to VariantService:** Complete data ✅
4. **VariantService:**
   - Reads stock: `50` ✅
   - Determines default variant per rule ✅
   - Updates `products.stock = 50` ✅
5. **Dashboard displays:** Stock = 50 ✅

---

## Timeline

- **Phase 4a:** Added VariantService stock update logic + fixed default variant index
- **Now (Deep Analysis):** Discovered validation rule gap that prevented stock from reaching the service
- **Next (Fix Implementation):** Add validation rules to requests

This explains why stock looked like it should work (the code is there) but didn't work (data never arrived).
