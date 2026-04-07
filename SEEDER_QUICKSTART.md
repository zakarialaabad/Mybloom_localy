# Quick Start: Running the ProductJsonSeeder

## ⚡ Quick Setup (5 minutes)

### 1. Verify JSON File Location
```bash
ls backend/database/products.json
# Should output: backend/database/products.json exists
```

### 2. Run the Seeder

**Run ONLY the JSON seeder (recommended for new data):**
```bash
cd backend
php artisan db:seed --class=Database\\Seeders\\ProductJsonSeeder
```

**Or full fresh migration with JSON seeder:**
```bash
cd backend
php artisan migrate:fresh
php artisan db:seed --class=Database\\Seeders\\ProductJsonSeeder
```

### 3. Verify Data Was Seeded

```bash
php artisan tinker
```

In the PHP interactive shell:
```php
>>> \App\Models\Product::count();
// Should return 31

>>> \App\Models\Product::first()->name;
// Should return "Summer in Bali"

>>> \App\Models\Product::first()->images;
// Should return the primary image

>>> \App\Models\Ingredient::count();
// Should return 15+

exit
```

## 📊 Data Being Seeded

From your `products.json`:

| Entity | Count | Source |
|--------|-------|--------|
| Brand | 1 | "My Bloom" from catalog.brand |
| Categories | 5 | catalog.categories |
| Product Types | ~10 | Unique type_produit values |
| Ingredients | ~15 | All unique ingredients |
| **Products** | **31** | catalog.products |
| Product Images | 31 | img_main field |
| Product Variants | 31+ | variants array |
| Product FAQs | 100+ | faqs array |

## 🔧 Database Tables Affected

```
brands
├── categories
├── product_types
├── ingredients
├── products
│   ├── product_images
│   ├── product_variants
│   ├── product_faqs
│   └── ingredient_product (pivot)
```

## ✅ What Happens

1. **Brand** "My Bloom" is created (or reused if exists)
2. **Categories**: beurre, gommage, maquillage, parfum, hygiene corporelle
3. **Product Types**: Body Butter, Body Scrub, Hair Mist, Diffuser, etc.
4. **Ingredients**: All unique ingredients from products
5. **Products**: 31 products with all relationships
6. **Images**: Primary image from `img_main` 
7. **Variants**: Size variants from `variants` array
8. **FAQs**: All questions/answers linked
9. **Relationships**: Ingredients linked to products via pivot table

## 🎯 Example JSON Data Flow

```
JSON: { "name": "Summer in Bali", "type_produit": "Body Butter", "img_main": "/images/..." }
  ↓
Product created with name, category_id, product_type_id
  ├─ Product Image: url=/images/..., is_primary=true
  ├─ Product Variant: size=200, price=80
  ├─ Product FAQs: linked from faqs array
  └─ Ingredients: each linked to product via pivot
```

## 🚀 Run It Now

```bash
cd backend
php artisan db:seed --class=Database\\Seeders\\ProductJsonSeeder
```

Expected output:
```
✅ ProductJsonSeeder completed successfully!
   Seeded 31 products
```

## 📂 Files Created

- ✅ `ProductJsonSeeder.php` - Main seeder class
- ✅ `products.json` - Data source (in database/ directory)
- ✅ `PRODUCT_JSON_SEEDER_README.md` - Full documentation

## 🐛 Troubleshooting

### "products.json not found"
→ Place it at `backend/database/products.json`

### Duplicate entries when running twice
→ This is normal. The seeder checks for slugs and won't duplicate products with same slug

### Want to reset and reseed?
```bash
cd backend
php artisan migrate:reset
php artisan migrate
php artisan db:seed --class=Database\\Seeders\\ProductJsonSeeder
```

### Want to clear only products?
```bash
cd backend
php artisan truncate:tables products product_images product_variants product_faqs ingredient_product
php artisan db:seed --class=Database\\Seeders\\ProductJsonSeeder
```

## Next Steps

1. Run the seeder ✅
2. Check frontend for products displaying ✅
3. Verify images load correctly ✅
4. Test product detail page ✅
5. Check ingredients linking ✅

---

**Need help?** Check `PRODUCT_JSON_SEEDER_README.md` for detailed documentation.
