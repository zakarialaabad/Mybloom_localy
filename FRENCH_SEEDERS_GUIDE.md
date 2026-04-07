# 🌿 French Seeders Setup Guide

## Overview

Three new seeders have been created with exact French data:

1. **CategorySeederFrench.php** - Categories (Beurre, Parfum, Gommage, etc.)
2. **ProductTypeSeederFrench.php** - Product Types (Corps, Visage, Cheveux, etc.)
3. **IngredientSeederFrench.php** - Ingredients with images from public folder

---

## 📂 Public Folder Structure

Your `public/ingredients/` folder should be organized like this:

```
public/
└── ingredients/
    ├── Mangue/
    │   └── image.jpg (or .png, .jpeg, .gif, .webp)
    ├── Vanille/
    │   └── image.jpg
    ├── Noix de coco/
    │   └── image.jpg
    ├── Aloe vera/
    │   └── image.jpg
    ├── Pépins de raisin/
    │   └── image.jpg
    ├── Sésame/
    │   └── image.jpg
    ├── Amande/
    │   └── image.jpg
    ├── Jojoba/
    │   └── image.jpg
    ├── Arbre à thé/
    │   └── image.jpg
    ├── Oliban/
    │   └── image.jpg
    ├── Eau de rose distillée/
    │   └── image.jpg
    ├── Avocat/
    │   └── image.jpg
    ├── Karité/
    │   └── image.jpg
    └── Cacao/
        └── image.jpg
```

### Folder Naming Options

The seeder is flexible and will look for folders in these ways:

1. **Exact name match:** `Mangue/`, `Vanille/`, `Noix de coco/`
2. **Slug format:** `mangue/`, `vanille/`, `noix-de-coco/` (lowercase with hyphens)

### Image File Naming

Within each ingredient folder, the seeder looks for:

1. **Common names first:**
   - `image.*` (jpg, jpeg, png, gif, webp, avif)
   - `ingredient.*`
   - `product.*`
   - `photo.*`
   - `pic.*`
   - `{ingredient-name}.*` (e.g., `mangue.jpg`)

2. **Any other image file** (first one found)

### Supported Image Formats

- `.jpg` / `.jpeg`
- `.png`
- `.gif`
- `.webp`
- `.avif`

---

## 🚀 How to Run

### Option 1: Run Individual Seeders

```bash
cd backend

# Seed categories
php artisan db:seed --class=Database\\Seeders\\CategorySeederFrench

# Seed product types
php artisan db:seed --class=Database\\Seeders\\ProductTypeSeederFrench

# Seed ingredients (with images from public/ingredients)
php artisan db:seed --class=Database\\Seeders\\IngredientSeederFrench
```

### Option 2: Run All Together

Create a master seeder or add to `DatabaseSeeder.php`:

```php
public function run(): void
{
    $this->call([
        CategorySeederFrench::class,
        ProductTypeSeederFrench::class,
        IngredientSeederFrench::class,
    ]);
}
```

Then run:
```bash
cd backend
php artisan db:seed
```

### Option 3: Run with Fresh Migration

```bash
cd backend
php artisan migrate:fresh
php artisan db:seed --class=Database\\Seeders\\CategorySeederFrench
php artisan db:seed --class=Database\\Seeders\\ProductTypeSeederFrench
php artisan db:seed --class=Database\\Seeders\\IngredientSeederFrench
```

---

## 📊 Data Being Seeded

### Categories (5)
✅ Beurre  
✅ Parfum  
✅ Gommage  
✅ Maquillage  
✅ Hygiene corporelle  

### Product Types (5)
✅ Corps  
✅ Visage  
✅ Cheveux  
✅ Lèvres  
✅ Maison  

### Ingredients (14)
✅ Mangue  
✅ Vanille  
✅ Noix de coco  
✅ Aloe vera  
✅ Pépins de raisin  
✅ Sésame  
✅ Amande  
✅ Jojoba  
✅ Arbre à thé  
✅ Oliban  
✅ Eau de rose distillée  
✅ Avocat  
✅ Karité  
✅ Cacao  

---

## 🎯 How the Image Seeder Works

1. **Scans** `public/ingredients/` folder
2. **For each ingredient:**
   - Looks for folder with ingredient name
   - Tries exact name (e.g., `Mangue/`)
   - Tries slug format (e.g., `mangue/`)
   - Finds first image file
   - Stores path in database
3. **Skips** ingredients that already exist
4. **Reports** success/errors

### Example Output

```
✅ Created: Mangue (image: /ingredients/Mangue/image.jpg)
✅ Created: Vanille (image: /ingredients/Vanille/vanille.png)
✅ Created: Noix de coco (image: /ingredients/Noix de coco/image.jpg)
⚠️  No image found in: /path/to/public/ingredients/Amande
✅ Ingredients seeded: 14 new ingredients added
```

---

## 📁 Directory Setup Steps

### Step 1: Create ingredients folder

```bash
mkdir public/ingredients
```

### Step 2: Create subfolders for each ingredient

```bash
mkdir public/ingredients/"Mangue"
mkdir public/ingredients/"Vanille"
mkdir public/ingredients/"Noix de coco"
mkdir public/ingredients/"Aloe vera"
mkdir public/ingredients/"Pépins de raisin"
mkdir public/ingredients/"Sésame"
mkdir public/ingredients/"Amande"
mkdir public/ingredients/"Jojoba"
mkdir public/ingredients/"Arbre à thé"
mkdir public/ingredients/"Oliban"
mkdir public/ingredients/"Eau de rose distillée"
mkdir public/ingredients/"Avocat"
mkdir public/ingredients/"Karité"
mkdir public/ingredients/"Cacao"
```

### Step 3: Add image files

Place image files in each folder. Example:

```
public/ingredients/Mangue/image.jpg
public/ingredients/Vanille/vanille.png
public/ingredients/Noix de coco/coconut.jpg
... etc
```

### Step 4: Run the seeders

```bash
cd backend
php artisan db:seed --class=Database\\Seeders\\CategorySeederFrench
php artisan db:seed --class=Database\\Seeders\\ProductTypeSeederFrench
php artisan db:seed --class=Database\\Seeders\\IngredientSeederFrench
```

---

## ✅ Verify Results

### Check Categories
```bash
cd backend
php artisan tinker
>>> \App\Models\Category::count()
5
>>> \App\Models\Category::pluck('name')
["Beurre", "Parfum", "Gommage", "Maquillage", "Hygiene corporelle"]
>>> exit
```

### Check Product Types
```bash
cd backend
php artisan tinker
>>> \App\Models\ProductType::count()
5
>>> \App\Models\ProductType::pluck('name')
["Corps", "Visage", "Cheveux", "Lèvres", "Maison"]
>>> exit
```

### Check Ingredients with Images
```bash
cd backend
php artisan tinker
>>> \App\Models\Ingredient::count()
14
>>> \App\Models\Ingredient::where('name', 'Mangue')->first()->image_url
"/ingredients/Mangue/image.jpg"
>>> exit
```

---

## 🛠️ Troubleshooting

### Images Not Found

**Problem:** Seeder says "No image found"

**Solution:**
1. Check folder exists: `public/ingredients/{ingredient_name}/`
2. Check image file is inside
3. Check file extension is supported (.jpg, .png, etc.)
4. Try creating folder with slug format: `public/ingredients/mangue/`

### Duplicate Entries

**Problem:** Running seeder twice creates duplicates

**Solution:** Seeders check if category/product type/ingredient exists before inserting. Just run again - it will skip existing entries.

### Special Characters in Folder Names

**Handling:**
- French accents work: `Aloe vera`, `Arbre à thé` ✓
- Spaces are preserved in folder names
- Seeder will try both exact name and slug format

---

## 📝 File Locations

| File | Location |
|------|----------|
| CategorySeederFrench.php | `backend/database/seeders/` |
| ProductTypeSeederFrench.php | `backend/database/seeders/` |
| IngredientSeederFrench.php | `backend/database/seeders/` |
| Ingredient images | `public/ingredients/` |

---

## 🎯 Next Steps

1. **Create folder:** `mkdir public/ingredients`
2. **Create subfolders:** One for each ingredient
3. **Add images:** Place image files in each folder
4. **Run seeders:** Use commands above
5. **Verify:** Check database with tinker

---

## 💡 Pro Tips

### Batch Create Folders (Windows PowerShell)
```powershell
@('Mangue', 'Vanille', 'Noix de coco', 'Aloe vera', 'Pépins de raisin', 'Sésame', 'Amande', 'Jojoba', 'Arbre à thé', 'Oliban', 'Eau de rose distillée', 'Avocat', 'Karité', 'Cacao') | ForEach-Object { mkdir "public/ingredients/$_" -Force }
```

### Batch Create Folders (Linux/Mac)
```bash
for ingredient in "Mangue" "Vanille" "Noix de coco" "Aloe vera" "Pépins de raisin" "Sésame" "Amande" "Jojoba" "Arbre à thé" "Oliban" "Eau de rose distillée" "Avocat" "Karité" "Cacao"; do
  mkdir -p "public/ingredients/$ingredient"
done
```

### Quick Test Run
```bash
cd backend
php artisan db:seed --class=Database\\Seeders\\IngredientSeederFrench
```

Then check output - it will show which images were found/not found.

---

## ✨ Features

✅ Auto-detects image files  
✅ Supports multiple image formats  
✅ Flexible folder naming (exact or slug)  
✅ Skips duplicates  
✅ Detailed output messages  
✅ No dependencies on external URLs  
✅ All images stored locally  

---

**Ready to go! Follow the steps above to seed your exact French data.** 🚀
