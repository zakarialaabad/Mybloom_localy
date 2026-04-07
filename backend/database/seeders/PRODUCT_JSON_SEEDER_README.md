# ProductJsonSeeder Documentation

## Overview

The `ProductJsonSeeder` reads product data from `products.json` file and seeds all related database tables with proper relationships.

## Features

✅ **Automatic Data Mapping**
- Brands: Extracts and creates the brand from JSON
- Categories: Creates all categories from the catalog
- Product Types: Automatically creates product types from `type_produit` field
- Ingredients: Collects and seeds all unique ingredients across all products
- Products: Seeds all products with full data
- Product Images: Uses `img_main` as the primary image
- Product Variants: Seeds all size variants from the variants array
- Product FAQs: Seeds all FAQs for each product
- Ingredient Relationships: Links ingredients to products via the pivot table

✅ **Smart Slug Generation**
- Auto-generates unique slugs for products, categories, and product types
- Handles duplicates automatically

✅ **Gender Mapping**
- Correctly maps JSON gender values (women/men/unisex/female/male) to database format

✅ **Status Flags**
- Preserves `is_best_seller`, `is_gift`, `is_recommended` flags from JSON

## JSON File Structure

The seeder expects `products.json` to have this structure:

```json
{
  "catalog": {
    "brand": "My Bloom",
    "total_products": 31,
    "categories": ["beurre", "gommage", "maquillage", "parfum", "hygiene corporelle"],
    "products": [
      {
        "id": 1,
        "name": "Product Name",
        "type_produit": "Body Butter",
        "img_main": "/images/path/to/image.png",
        "subtitle": "Product subtitle",
        "description": "Full description",
        "price": 80,
        "original_price": null,
        "stock": 100,
        "is_best_seller": false,
        "is_gift": false,
        "is_recommended": true,
        "gender": "unisex",
        "category": "beurre",
        "type": "corps",
        "variants": [
          { "size": 200, "price": 80, "final_price": 80, "original_price": null, "promotion_percent": 0, "stock_quantity": 100 }
        ],
        "ingredients": [
          { "id": 1, "name": "Sesame", "image_url": null }
        ],
        "faqs": [
          { "question": "Can I use daily?", "answer": "Yes, you can..." }
        ]
      }
    ]
  }
}
```

## File Location

Place your `products.json` file at:
```
backend/database/products.json
```

## How to Run the Seeder

### Option 1: Run as Standalone Seeder

```bash
cd backend
php artisan db:seed --class=Database\\Seeders\\ProductJsonSeeder
```

### Option 2: Add to Main DatabaseSeeder (Optional)

Edit `backend/database/seeders/DatabaseSeeder.php`:

```php
public function run(): void
{
    $this->call([
        AdminSeeder::class,
        // ... other seeders ...
        ProductJsonSeeder::class,  // ← Add this line
    ]);
}
```

Then run:
```bash
php artisan db:seed
```

### Option 3: Clear Database and Reseed

```bash
cd backend
php artisan migrate:fresh --seed
```

If you only want the JSON products, first delete/comment out other product seeders in DatabaseSeeder, then run:
```bash
php artisan migrate:fresh
php artisan db:seed --class=Database\\Seeders\\ProductJsonSeeder
```

## What Gets Created

### Tables Populated

1. **brands** - Creates 1 brand ("My Bloom")
2. **categories** - Creates 5 categories from the JSON
3. **product_types** - Creates product types from `type_produit` field
4. **ingredients** - Creates all unique ingredients
5. **products** - Creates all 31 products
6. **product_images** - Creates primary image for each product
7. **product_variants** - Creates all size variants
8. **product_faqs** - Creates all FAQ entries
9. **ingredient_product** - Creates the many-to-many relationships

### Data Integrity

- ✅ All foreign keys properly linked
- ✅ Slugs are unique
- ✅ Gender values mapped correctly
- ✅ Status flags (best_seller, gift, recommended) preserved
- ✅ Images linked as primary (is_primary = true)
- ✅ Ingredients linked to products

## Database Schema Reference

### Products Table
```
id, brand_id, category_id, product_type_id, name, slug, subtitle, 
description, ingredients, gender, price, original_price, stock, 
is_active, is_featured, is_best_seller, is_gift, is_recommended,
created_at, updated_at, deleted_at
```

### Product Images Table
```
id, product_id, url, alt, sort_order, is_primary, created_at
```

### Product Variants Table
```
id, product_id, size, price, is_default, created_at, updated_at
```

### Product FAQs Table
```
id, product_id, question, answer, created_at, updated_at
```

### Ingredient Product Pivot Table
```
product_id, ingredient_id (composite primary key)
```

## Troubleshooting

### "products.json not found"
- Ensure the file is at `backend/database/products.json`
- Check the file path in the error message

### Duplicate Entry for Slug
- The seeder automatically generates unique slugs
- If you run it multiple times, existing products won't be duplicated (slugs are unique)

### Ingredients Not Linking
- Ensure ingredient names in the JSON exactly match
- The seeder links by ingredient name

### Foreign Key Constraints
- All necessary parent tables (brands, categories, product_types) are created before products
- Products are created before product_images, variants, and FAQs

## Notes

- The seeder uses `insertGetId()` to handle relationships efficiently
- No model events are triggered (uses raw DB inserts for speed)
- Timestamps are set to `now()` for all entries
- Images are marked as primary with `is_primary = true`
- First variant of each product is marked as default

## Example Output

```
✅ ProductJsonSeeder completed successfully!
   Seeded 31 products
   Created brand: My Bloom
   Created categories: 5
   Created product types: 10+
   Created ingredients: 20+
   Created product images: 31
   Created product variants: 31+
   Created product FAQs: 100+
```
