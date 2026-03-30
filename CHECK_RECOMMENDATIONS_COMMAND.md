# Check Recommendation Products Count - Terminal Commands

## Quick Summary

Display the number of recommended products stored in your database by running this command in terminal:

```bash
php artisan recommendations:count
```

---

## Installation Steps (First Time Only)

1. **The command is ready to use** - no installation needed!
2. The command file is located at: `backend/app/Console/Commands/RecommendationsCountCommand.php`
3. Laravel will auto-discover the command

---

## Usage

### Method 1: Direct Command (Recommended)

```bash
# Navigate to backend directory
cd backend

# Run the command
php artisan recommendations:count
```

### Method 2: From Root Directory

```bash
# From workspace root
php artisan recommendations:count

# Or with full path
php backend/artisan recommendations:count
```

### Method 3: Using Shell Script (Windows)

```bash
# From workspace root
bash backend/scripts/check-recommendations.sh
```

---

## Output Example

When you run the command, you'll see:

```
╔══════════════════════════════════════════════════════════════╗
║          RECOMMENDATION PRODUCTS DATABASE CHECK              ║
║              Product Count Verification Tool                 ║
╚══════════════════════════════════════════════════════════════╝

RECOMMENDATION COUNT: 12

✅ Found 12 recommended products in database

RECOMMENDED PRODUCTS
+----+-----+------------------------+------------------+-----------+--------+
| #  | ID  | Name                   | Slug             | Price     | Status |
+----+-----+------------------------+------------------+-----------+--------+
| 1  | 5   | Rose Perfume Classic   | rose-perfume-... | 299.99 DH | ✅ Act |
| 2  | 8   | Ocean Breeze Cologne   | ocean-breeze-... | 399.50 DH | ✅ Act |
| 3  | 12  | Lavender Essence       | lavender-essen.. | 249.99 DH | ✅ Act |
| ... | ... | ...                    | ...              | ...       | ...    |
+----+-----+------------------------+------------------+-----------+--------+

STATISTICS
Total Recommended: 12
Active: 12
Inactive: 0
Average Price: 298.75 DH

VERIFICATION
To verify this count matches the frontend:
1. Open product detail page
2. Scroll to "You may also Like" section
3. Open Browser Console (F12)
4. Look for "RECOMMENDATION COUNT VERIFICATION" log
5. Compare the numbers - they should match: 12 products

═══════════════════════════════════════════════════════════════
✅ Database contains 12 recommended products
═══════════════════════════════════════════════════════════════
```

---

## What The Command Does

✅ **Queries Database**
- Finds all products with `is_recommended = true`
- Fetches ID, name, slug, price, and status

✅ **Displays Total Count**
- Shows exact number of recommended products

✅ **Lists All Products**
- Shows table with:
  - Product ID
  - Product name
  - Product slug
  - Price in DH
  - Active/Inactive status

✅ **Shows Statistics**
- Total count
- Active vs Inactive products
- Average price

✅ **Verification Guide**
- Instructions to compare with frontend count
- Helps verify database matches what's displayed

---

## Verification Against Frontend

### Step 1: Run Database Command
```bash
php artisan recommendations:count
# Note the count: e.g., 12 products
```

### Step 2: Check Frontend
1. Go to any product page in browser
2. Scroll to "You may also Like" section
3. Press **F12** to open Developer Tools → **Console** tab

### Step 3: Compare Counts
In the Console, you'll see:
```javascript
📊 RECOMMENDATION COUNT VERIFICATION
Product ID: 42
Displayed Count: 12      ← Should match database count
Actual Array Length: 12  ← Should match database count
Match: ✅ PASS
Recommendations: [...]
```

✅ **If numbers match:** Database and frontend are synced!
❌ **If numbers differ:** Check API response or recommendations configuration

---

## Troubleshooting

### Command Not Found
```bash
# Error: Command "recommendations:count" is not defined
# Solution: Make sure you're in the backend directory
cd backend
php artisan recommendations:count

# Or use full path
php artisan recommendations:count
```

### No Recommended Products Found
```
⚠️ No recommended products found in database!
```

**Solution:** You need to mark products as recommended:

**Option 1: Via Laravel Tinker**
```bash
php artisan tinker
>>> $product = App\Models\Product::find(5);
>>> $product->update(['is_recommended' => true]);
>>> exit
```

**Option 2: Via SQL**
```sql
UPDATE products SET is_recommended = 1 WHERE id IN (5, 8, 12, 15);
```

**Option 3: Via Database Seeder**
See `database/seeders/` for existing seeders.

---

## Database Query (SQL Equivalent)

The command runs this SQL query:

```sql
SELECT id, name, slug, price, original_price, is_active 
FROM products 
WHERE is_recommended = true 
ORDER BY id;
```

You can also run this directly in your database client if needed.

---

## Additional Commands

### Count Only (Quick Version)

```bash
php artisan tinker
>>> App\Models\Product::where('is_recommended', true)->count()
// Returns: 12
```

### Export as JSON

```bash
php artisan tinker
>>> App\Models\Product::where('is_recommended', true)->get()->toJson()
// Outputs JSON format
```

### Mark Products as Recommended (Bulk)

```bash
php artisan tinker
>>> App\Models\Product::whereIn('id', [5, 8, 12, 15])->update(['is_recommended' => true]);
// Updates multiple products
```

---

## Environment Requirements

- **PHP:** 8.0+
- **Laravel:** 11.x
- **Database:** MySQL/MariaDB
- **Command:** `php artisan`

---

## Files Created/Modified

| File | Purpose |
|------|---------|
| `backend/app/Console/Commands/RecommendationsCountCommand.php` | Main Artisan command |
| `backend/scripts/check-recommendations.sh` | Shell script wrapper |
| `RECOMMENDATION_CAROUSEL.md` | Frontend carousel documentation |
| `frontend/lib/testRecommendationCount.ts` | Frontend verification utility |

---

## Quick Command Reference

```bash
# Check count
php artisan recommendations:count

# Interactive shell
php artisan tinker

# See all available commands
php artisan list

# Get command help
php artisan recommendations:count --help
```

---

**Last Updated:** March 30, 2026
**Status:** ✅ Ready to use
