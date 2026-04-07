# ProductJsonSeeder - Real Data Examples

## Sample Product: Summer in Bali (Body Butter)

### Source JSON
```json
{
  "id": 1,
  "name": "Summer in Bali",
  "type_produit": "Body Butter",
  "img_main": "/images/Summer in Bali Body Butter/summer-in-bali-body-butter-img_main.png",
  "subtitle": "Plongez dans la chaleur d'une sérénité tropicale",
  "description": "Ce beurre corporel 100% naturel, enrichi en huile de sésame et huile de pépins de raisin...",
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
    {
      "size": 200,
      "price": 80,
      "final_price": 80,
      "original_price": null,
      "promotion_percent": 0,
      "stock_quantity": 100
    }
  ],
  "ingredients": [
    { "id": 1, "name": "Sésame", "image_url": null },
    { "id": 2, "name": "Pépins de raisin", "image_url": null }
  ],
  "faqs": [
    {
      "question": "Peut-on l'utiliser quotidiennement ?",
      "answer": "Oui, il est recommandé de l'utiliser quotidiennement pour obtenir une hydratation..."
    },
    {
      "question": "Peut-on l'utiliser sur le visage ?",
      "answer": "Non, ce beurre est exclusivement destiné au corps."
    },
    {
      "question": "Aide-t-il à unifier le teint ?",
      "answer": "Oui, sa formule contribue à réduire les taches pigmentaires..."
    },
    {
      "question": "Les ingrédients sont-ils naturels ?",
      "answer": "Oui, ce produit est fabriqué avec des ingrédients 100% naturels."
    }
  ]
}
```

### Database Tables After Seeding

#### 1. brands table
```
┌────┬───────────┬───────────┬──────────┬──────────────┬──────────────┐
│ id │ name      │ slug      │ logo_url │ created_at   │ updated_at   │
├────┼───────────┼───────────┼──────────┼──────────────┼──────────────┤
│ 1  │ My Bloom  │ my-bloom  │ NULL     │ 2024-04-06   │ 2024-04-06   │
└────┴───────────┴───────────┴──────────┴──────────────┴──────────────┘
```

#### 2. categories table
```
┌────┬───────────────────┬───────────────────┬──────────┬────────────┬──────────────┬──────────────┐
│ id │ name              │ slug              │ parent_id│ sort_order │ created_at   │ updated_at   │
├────┼───────────────────┼───────────────────┼──────────┼────────────┼──────────────┼──────────────┤
│ 1  │ beurre            │ beurre            │ NULL     │ 0          │ 2024-04-06   │ 2024-04-06   │
│ 2  │ gommage           │ gommage           │ NULL     │ 0          │ 2024-04-06   │ 2024-04-06   │
│ 3  │ maquillage        │ maquillage        │ NULL     │ 0          │ 2024-04-06   │ 2024-04-06   │
│ 4  │ parfum            │ parfum            │ NULL     │ 0          │ 2024-04-06   │ 2024-04-06   │
│ 5  │ hygiene corporelle│ hygiene-corporelle│ NULL     │ 0          │ 2024-04-06   │ 2024-04-06   │
└────┴───────────────────┴───────────────────┴──────────┴────────────┴──────────────┴──────────────┘
```

#### 3. product_types table
```
┌────┬──────────────┬──────────────┬────────────┬──────────────┬──────────────┐
│ id │ name         │ slug         │ sort_order │ created_at   │ updated_at   │
├────┼──────────────┼──────────────┼────────────┼──────────────┼──────────────┤
│ 1  │ Body Butter  │ body-butter  │ 0          │ 2024-04-06   │ 2024-04-06   │
│ 2  │ Body Scrub   │ body-scrub   │ 0          │ 2024-04-06   │ 2024-04-06   │
│ 3  │ Hair Mist    │ hair-mist    │ 0          │ 2024-04-06   │ 2024-04-06   │
└────┴──────────────┴──────────────┴────────────┴──────────────┴──────────────┘
```

#### 4. ingredients table  
```
┌────┬───────────────┬──────────┬──────────────┬──────────────┐
│ id │ name          │ image_url│ created_at   │ updated_at   │
├────┼───────────────┼──────────┼──────────────┼──────────────┤
│ 1  │ Sésame        │ NULL     │ 2024-04-06   │ 2024-04-06   │
│ 2  │ Pépins de rais│ NULL     │ 2024-04-06   │ 2024-04-06   │
│ 3  │ Jojoba        │ NULL     │ 2024-04-06   │ 2024-04-06   │
└────┴───────────────┴──────────┴──────────────┴──────────────┘
```

#### 5. products table (main entry)
```
┌────┬──────────┬──────────┬────────────────┬─────────────────────┬──────┬────────┬─────────┬──────────────┬───────────┬─────────────┬──────────┬───────────┬──────────────┬──────────┬─────────────┬──────────────┬──────────────┐
│ id │ brand_id │ category │ product_type_id│ name                │ slug │ gender │ price   │ orig_price  │ stock     │ is_active  │ is_best  │ is_gift   │ is_recommend │created_at│ updated_at   │ deleted_at   │
├────┼──────────┼──────────┼────────────────┼─────────────────────┼──────┼────────┼─────────┼──────────────┼───────────┼─────────────┼──────────┼───────────┼──────────────┼──────────┼─────────────┼──────────────┤
│ 1  │ 1        │ 1        │ 1              │ Summer in Bali      │ sum… │ unisex │ 80.00   │ NULL        │ 100       │ true       │ false    │ false     │ true         │ 2024-04-06 │ 2024-04-06 │ NULL        │
│ 2  │ 1        │ 2        │ 2              │ Summer in Bali      │ sum…-2│unisex │ 80.00   │ NULL        │ 10        │ true       │ false    │ false     │ true         │ 2024-04-06 │ 2024-04-06 │ NULL        │
└────┴──────────┴──────────┴────────────────┴─────────────────────┴──────┴────────┴─────────┴──────────────┴───────────┴─────────────┴──────────┴───────────┴──────────────┴──────────┴─────────────┴──────────────┘

Note: Slug "summer-in-bali-2" because first product ID:1 also has same name
```

#### 6. product_images table
```
┌────┬────────────┬────────────────────────────────────────────────────────┬──────────┬────────────┬──────────────┬──────────────┐
│ id │ product_id │ url                                                    │ alt      │ sort_order │ is_primary   │ created_at   │
├────┼────────────┼────────────────────────────────────────────────────────┼──────────┼────────────┼──────────────┼──────────────┤
│ 1  │ 1          │ /images/Summer in Bali Body…/summer-in-bali-body…     │ Summer…  │ 0          │ true         │ 2024-04-06   │
│ 2  │ 2          │ /images/Summer in Bali Body…/summer-in-bali-body…     │ Summer…  │ 0          │ true         │ 2024-04-06   │
└────┴────────────┴────────────────────────────────────────────────────────┴──────────┴────────────┴──────────────┴──────────────┘
```

#### 7. product_variants table
```
┌────┬────────────┬──────┬────────┬──────────────┬──────────────┬──────────────┐
│ id │ product_id │ size │ price  │ is_default   │ created_at   │ updated_at   │
├────┼────────────┼──────┼────────┼──────────────┼──────────────┼──────────────┤
│ 1  │ 1          │ 200  │ 80.00  │ true         │ 2024-04-06   │ 2024-04-06   │
│ 2  │ 2          │ 200  │ 80.00  │ true         │ 2024-04-06   │ 2024-04-06   │
└────┴────────────┴──────┴────────┴──────────────┴──────────────┴──────────────┘
```

#### 8. product_faqs table
```
┌────┬────────────┬──────────────────────────┬──────────────────────────────────┬──────────────┬──────────────┐
│ id │ product_id │ question                 │ answer                           │ created_at   │ updated_at   │
├────┼────────────┼──────────────────────────┼──────────────────────────────────┼──────────────┼──────────────┤
│ 1  │ 1          │ Peut-on l'utiliser...    │ Oui, il est recommandé...        │ 2024-04-06   │ 2024-04-06   │
│ 2  │ 1          │ Peut-on l'utiliser...    │ Non, ce beurre est...            │ 2024-04-06   │ 2024-04-06   │
│ 3  │ 1          │ Aide-t-il à unifier...   │ Oui, sa formule contribue...     │ 2024-04-06   │ 2024-04-06   │
│ 4  │ 1          │ Les ingrédients sont...  │ Oui, ce produit est fabriqué...  │ 2024-04-06   │ 2024-04-06   │
│ 5  │ 2          │ Peut-on l'utiliser...    │ Il est recommandé...             │ 2024-04-06   │ 2024-04-06   │
└────┴────────────┴──────────────────────────┴──────────────────────────────────┴──────────────┴──────────────┘
```

#### 9. ingredient_product (Pivot Table)
```
┌────────────┬─────────────────┐
│ product_id │ ingredient_id   │
├────────────┼─────────────────┤
│ 1          │ 1 (Sésame)      │  ← Links to product 1
│ 1          │ 2 (Pépins rais) │  ← Links to product 1
│ 2          │ 2 (Pépins rais) │  ← Links to product 2
│ 2          │ 1 (Sésame)      │  ← Links to product 2
└────────────┴─────────────────┘
```

## Complete Data Path for One Product

```
JSON Input:
{
  "name": "Summer in Bali",
  "type_produit": "Body Butter",
  "category": "beurre",
  "price": 80,
  "img_main": "/images/...",
  "variants": [...],
  "ingredients": [...],
  "faqs": [...]
}

SEEDING PROCESS:
1. Check/Create Brand "My Bloom" → brands.id = 1
2. Check/Create Category "beurre" → categories.id = 1
3. Check/Create ProductType "Body Butter" → product_types.id = 1
4. Check/Create Ingredients:
   ├─ "Sésame" → ingredients.id = 1
   ├─ "Pépins de raisin" → ingredients.id = 2
5. Create Product → products.id = 1
   ├─ brand_id = 1
   ├─ category_id = 1
   ├─ product_type_id = 1
   ├─ name = "Summer in Bali"
   ├─ slug = "summer-in-bali"
   ├─ price = 80.00
   ├─ is_recommended = true
6. Create Product Image → product_images.id = 1
   ├─ product_id = 1
   ├─ url = "/images/Summer in Bali Body Butter/..."
   ├─ is_primary = true
7. Create Product Variants → product_variants.id = 1
   ├─ product_id = 1
   ├─ size = 200
   ├─ price = 80.00
   ├─ is_default = true
8. Create Product FAQs → product_faqs.id = 1, 2, 3, 4
   ├─ product_id = 1
   ├─ question/answer pairs
9. Link Ingredients → ingredient_product
   ├─ (product_id=1, ingredient_id=1)
   └─ (product_id=1, ingredient_id=2)

DATABASE RESULT:
✓ 1 product created
✓ 1 image linked (primary)
✓ 1 variant created (default)
✓ 4 FAQs linked
✓ 2 ingredients linked
```

## All 31 Products Being Seeded

```
1. Summer in Bali (Body Butter) - beurre
2. Summer in Bali (Body Scrub) - gommage
3. A Lot of Love (Body Scrub) - gommage
4. A Lot of Love (Body Butter) - beurre
5. Sugar Pop (Body Scrub) - gommage
6. Sugar Pop (Body Butter) - beurre
7. Cherry Tint (Tint Visage) - maquillage
8. Sexy Bloom Hair Mist - parfum
9. The Secret Hair Mist - parfum
10. Paradis Adress Hair Mist - parfum
11. Heartbeat Body Mist - parfum
12. Over Dose Body Mist - parfum
13. Remember Body Mist - parfum
14. Deo Roll-On Femme - hygiene corporelle
15. Deo Roll-On Homme - hygiene corporelle
16. La Luna Crème Parfumée - parfum
17. Imperial Valley Crème Parfumée - parfum
18. Bombshel Passion Crème Parfumée - parfum
19. Eros Crème Parfumée - parfum
20. One And Only Crème Parfumée - parfum
21. Nina Ricci Crème Parfumée - parfum
22. Hudson Valley Crème Parfumée - parfum
23. Idol Crème Parfumée - parfum
24. Fruité des Bois Diffuseur - parfum
25. Mange Pêche Diffuseur - parfum
26. Coco Diffuseur - parfum
27. My Bloom Spray d'Intérieur Tropical - parfum
28. My Bloom Spray d'Intérieur Caramel - parfum
29. My Bloom Spray d'Intérieur Oud - parfum
30. Coffret Cadeau Bloom d'Amour - parfum
31. B71) /D9 (Huile Parfumée) - parfum
```

## Verifying After Seeding

```bash
# Check how many products exist
php artisan tinker
>>> \App\Models\Product::count()
31

# Check a specific product with all relations
>>> $p = \App\Models\Product::first();
>>> $p->name
"Summer in Bali"

>>> $p->images()->count()
1

>>> $p->variants()->count()
1

>>> $p->faqs()->count()
4

>>> $p->ingredients()->count()
2

>>> $p->ingredients->pluck('name')
["Sésame", "Pépins de raisin"]

>>> $p->brand->name
"My Bloom"

>>> $p->category->name
"beurre"

>>> exit
```

---

This document shows how your JSON data maps to the actual database structure when the seeder runs.
