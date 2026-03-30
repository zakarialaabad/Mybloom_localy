# Recommended Products Seeders

Two seeders for managing recommended products in the database.

## Overview

Recommended products (`is_recommended = true`) appear in the **"You may also Like"** carousel on product detail pages.

---

## Seeder 1: RecommendedProductSeeder

**File:** `backend/database/seeders/RecommendedProductSeeder.php`

### Purpose
Marks **10 random active products** as recommended without clearing existing recommendations.

### Usage

**Option A: Part of Full Database Seed**
```bash
php artisan migrate:fresh --seed
# Runs all seeders including RecommendedProductSeeder
```

**Option B: Run Independently**
```bash
php artisan db:seed --class=RecommendedProductSeeder
```

### Behavior
- Selects 10 random active products
- Marks them as `is_recommended = true`
- **Preserves existing recommendations**
- Useful for adding more recommendations gradually

### Output Example
```
Marking 10 products as recommended...
✅ Marked as recommended: Santal Ivoire (ID: 74)
✅ Marked as recommended: Trésor Midnight (ID: 43)
✅ Marked as recommended: Versus Cologne (ID: 34)
... (7 more products)
✅ Successfully marked 10 products as recommended!
```

---

## Seeder 2: FreshRecommendedProductSeeder

**File:** `backend/database/seeders/FreshRecommendedProductSeeder.php`

### Purpose
**Resets all recommendations and marks exactly 10 specific products** as recommended.

### Usage

```bash
php artisan db:seed --class=FreshRecommendedProductSeeder
```

### Behavior
1. Clears ALL existing recommendations (`is_recommended = false` for all products)
2. Marks the first 10 products (IDs 1-10) as recommended
3. Shows formatted output with product details

### Output Example
```
Resetting and marking 10 fresh recommended products...

✓ Cleared all existing recommendations

✅ Over Dose (ID: 1) — 140.00 DH
✅ Sugar Pop (ID: 2) — 120.00 DH
✅ Velvet Noir (ID: 3) — 280.00 DH
✅ Atlas Rose (ID: 4) — 240.00 DH
✅ Bois du Sahara (ID: 5) — 260.00 DH
✅ Cactus Flower (ID: 6) — 95.00 DH
✅ Ambre Royal (ID: 7) — 310.00 DH
✅ Jasmine Night (ID: 8) — 220.00 DH
✅ Marine Breeze (ID: 9) — 85.00 DH
✅ Nude Rose (ID: 10) — 110.00 DH

╔═══════════════════════════════════════════════════════════════╗
║   ✅ Successfully marked 10 products as recommended!          ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## Seeding Strategies

### Strategy 1: First-Time Setup (Recommended)
```bash
# Fresh database with 10 recommendations
php artisan migrate:fresh --seed
# Includes FreshRecommendedProductSeeder in DatabaseSeeder
```

### Strategy 2: Add More Recommendations
```bash
# Add 10 more random products to existing recommendations
php artisan db:seed --class=RecommendedProductSeeder
```

### Strategy 3: Reset Recommendations
```bash
# Clear all and set only 10 specific products
php artisan db:seed --class=FreshRecommendedProductSeeder
```

### Strategy 4: Manual Database Update
```bash
# Mark specific products as recommended
php artisan tinker
>>> App\Models\Product::whereIn('id', [5, 8, 12, 15, 20])->update(['is_recommended' => true]);
>>> exit
```

---

## Verification

### Check Count
```bash
php artisan recommendations:count
```

**Output:**
```
✅ Database contains 10 recommended products

RECOMMENDED PRODUCTS
+----+----+----------------+----------------+-----------+-----------+
| #  | ID | Name           | Slug           | Price     | Status    |
+----+----+----------------+----------------+-----------+-----------+
| 1  | 1  | Over Dose      | over-dose      | 140.00 DH | ✅ Active |
| 2  | 2  | Sugar Pop      | sugar-pop      | 120.00 DH | ✅ Active |
... (8 more)
+----+----+----------------+----------------+-----------+-----------+

STATISTICS
Total Recommended: 10
Active: 10
Average Price: 186.00 DH
```

### Frontend Verification
1. Navigate to any product page
2. Scroll to **"You may also Like"** carousel
3. Open Browser Console (F12)
4. Look for `RECOMMENDATION COUNT VERIFICATION` log
5. Database count should match displayed count ✅

---

## Database Seeder Integration

Both seeders are automatically called in sequence when using full database seed:

**File:** `backend/database/seeders/DatabaseSeeder.php`

```php
public function run(): void {
    $this->call([
        // ... other seeders ...
        ProductFaqSeeder::class,         // 15 — 3 FAQs linked to every product
        RecommendedProductSeeder::class, // 16 — 10 recommended products for carousel
    ]);
}
```

---

## Use Cases

### Use RecommendedProductSeeder When:
- Adding recommendations to existing database
- Wanting random product selection
- Building recommendations gradually
- Incrementally adding carousel products

### Use FreshRecommendedProductSeeder When:
- Fresh database setup
- Testing carousel with consistent products
- Resetting recommendations
- Creating reproducible database state

---

## Customization

### Change Product Selection

**RecommendedProductSeeder.php** (line 19-23):
```php
// Currently: 10 random products
$products = Product::where('is_active', true)
    ->inRandomOrder()
    ->limit(10)        // ← Change this number
    ->get();
```

**FreshRecommendedProductSeeder.php** (line 29-32):
```php
// Currently: First 10 products (IDs 1-10)
$products = Product::where('is_active', true)
    ->orderBy('id')
    ->limit(10)        // ← Change this number
    ->get();
```

### Filter by Specific Criteria

**By Gender:**
```php
$products = Product::where('is_active', true)
    ->where('gender', 'women')  // or 'men', 'unisex'
    ->limit(10)
    ->get();
```

**By Category:**
```php
$products = Product::where('is_active', true)
    ->where('category_id', 4)   // or other category IDs
    ->limit(10)
    ->get();
```

**By Price Range:**
```php
$products = Product::where('is_active', true)
    ->whereBetween('price', [200, 500])
    ->limit(10)
    ->get();
```

---

## Current Seeded Data

**10 Recommended Products (After Fresh Seed):**

| ID  | Name | Slug | Price | Status |
|-----|------|------|-------|--------|
| 1   | Over Dose | over-dose | 140.00 DH | ✅ |
| 2   | Sugar Pop | sugar-pop | 120.00 DH | ✅ |
| 3   | Velvet Noir | velvet-noir | 280.00 DH | ✅ |
| 4   | Atlas Rose | atlas-rose | 240.00 DH | ✅ |
| 5   | Bois du Sahara | bois-du-sahara | 260.00 DH | ✅ |
| 6   | Cactus Flower | cactus-flower | 95.00 DH | ✅ |
| 7   | Ambre Royal | ambre-royal | 310.00 DH | ✅ |
| 8   | Jasmine Night | jasmine-night | 220.00 DH | ✅ |
| 9   | Marine Breeze | marine-breeze | 85.00 DH | ✅ |
| 10  | Nude Rose | nude-rose | 110.00 DH | ✅ |

**Average Price:** 186.00 DH

---

## Troubleshooting

### Seeder Not Running
```bash
# Clear cache and try again
php artisan cache:clear
php artisan db:seed --class=RecommendedProductSeeder
```

### No Products Marked
```bash
# Check if active products exist
php artisan tinker
>>> App\Models\Product::where('is_active', true)->count();
```

### Want to See Recommendations?
```bash
# Navigate to product detail page and scroll to carousel
# Or verify via API
GET /api/v1/products/{slug}
# Response includes "recommendations" array
```

---

## Related Commands

```bash
# Check recommendations
php artisan recommendations:count

# Interactive database editor
php artisan tinker

# Run specific seeder
php artisan db:seed --class=RecommendedProductSeeder

# Fresh database with all seeders
php artisan migrate:fresh --seed

# Rollback migrations
php artisan migrate:rollback
```

---

**Last Updated:** March 30, 2026  
**Status:** ✅ Ready for production
