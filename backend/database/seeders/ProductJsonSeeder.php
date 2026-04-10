<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Exception;

class ProductJsonSeeder extends Seeder
{
    /**
     * Run the database seeds from products.json
     */
    public function run(): void
    {
        // Path to your products.json file
        $jsonPath = database_path('seeders/products.json');

        if (!file_exists($jsonPath)) {
            throw new Exception("products.json not found at {$jsonPath}");
        }

        $contents = file_get_contents($jsonPath);
        // Detect and convert from Windows-1252/Latin-1 to UTF-8 if needed
        if (!mb_check_encoding($contents, 'UTF-8')) {
            $contents = mb_convert_encoding($contents, 'UTF-8', 'Windows-1252');
        }
        // Strip control characters that break JSON parsing
        $contents = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/', '', $contents);

        $json = json_decode($contents, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            throw new Exception("JSON parse error: " . json_last_error_msg());
        }
        if (!isset($json['catalog']) || !isset($json['catalog']['products'])) {
            throw new Exception("Invalid JSON structure. Expected 'catalog.products' key.");
        }

        $catalog = $json['catalog'];
        $products = $catalog['products'];

        // ════════════════════════════════════════════════════════════════
        // STEP 1: Seed Brands — catalog brand + all unique per-product brands
        // ════════════════════════════════════════════════════════════════
        $catalogBrand = $catalog['brand'];
        $this->seedBrand($catalogBrand); // ensure catalog brand exists

        // Build a brand name → ID map for all unique brands in products
        $brandMap = $this->seedAllBrands($products, $catalogBrand);

        // ════════════════════════════════════════════════════════════════
        // STEP 2: Seed Categories
        // ════════════════════════════════════════════════════════════════
        $categoryMap = $this->seedCategories($catalog['categories']);

        // ════════════════════════════════════════════════════════════════
        // STEP 3: Seed Product Types (from type_produit field)
        // ════════════════════════════════════════════════════════════════
        $productTypeMap = $this->seedProductTypes($products);

        // ════════════════════════════════════════════════════════════════
        // STEP 4: Seed Ingredients (all unique ingredients from all products)
        // ════════════════════════════════════════════════════════════════
        $ingredientMap = $this->seedIngredients($products);

        // ════════════════════════════════════════════════════════════════
        // STEP 5: Seed Products, Images, Variants, FAQs, and Ingredients
        // ════════════════════════════════════════════════════════════════
        foreach ($products as $jsonProduct) {
            $this->seedProduct(
                $jsonProduct,
                $catalogBrand,
                $brandMap,
                $categoryMap,
                $productTypeMap,
                $ingredientMap
            );
        }

        $this->command->info("✅ ProductJsonSeeder completed successfully!");
        $this->command->info("   Seeded " . count($products) . " products");
    }

    /**
     * Seed a single brand and return its ID.
     */
    private function seedBrand(string $brandName): int
    {
        $slug = Str::slug($brandName);

        $brand = DB::table('brands')->where('slug', $slug)->first();
        if ($brand) {
            return $brand->id;
        }

        return DB::table('brands')->insertGetId([
            'name' => $brandName,
            'slug' => $slug,
            'logo_url' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * Seed all unique per-product brands and return a name → ID map.
     */
    private function seedAllBrands(array $products, string $catalogBrand): array
    {
        $names = [$catalogBrand => true];
        foreach ($products as $p) {
            if (!empty($p['brand'])) {
                $names[$p['brand']] = true;
            }
        }

        $map = [];
        foreach (array_keys($names) as $name) {
            $map[$name] = $this->seedBrand($name);
        }
        return $map;
    }

    /**
     * Seed categories and return category ID map
     */
    private function seedCategories(array $categoryNames): array
    {
        $map = [];

        foreach ($categoryNames as $name) {
            $slug = Str::slug($name);

            $existing = DB::table('categories')
                ->where('slug', $slug)
                ->where('parent_id', null)
                ->first();

            if ($existing) {
                $map[$name] = $existing->id;
                continue;
            }

            $id = DB::table('categories')->insertGetId([
                'parent_id' => null,
                'name' => $name,
                'slug' => $slug,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $map[$name] = $id;
        }

        return $map;
    }

    /**
     * Seed product types and return product type ID map
     */
    private function seedProductTypes(array $products): array
    {
        $typeNames = [];
        foreach ($products as $product) {
            if (isset($product['type_produit'])) {
                $typeNames[$product['type_produit']] = true;
            }
        }

        $map = [];
        foreach (array_keys($typeNames) as $typeName) {
            $slug = Str::slug($typeName);

            $existing = DB::table('product_types')
                ->where('slug', $slug)
                ->first();

            if ($existing) {
                $map[$typeName] = $existing->id;
                continue;
            }

            $id = DB::table('product_types')->insertGetId([
                'name' => $typeName,
                'slug' => $slug,
                'sort_order' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $map[$typeName] = $id;
        }

        return $map;
    }

    /**
     * Seed ingredients and return ingredient ID map (by name)
     */
    private function seedIngredients(array $products): array
    {
        $ingredientNames = [];

        foreach ($products as $product) {
            if (isset($product['ingredients']) && is_array($product['ingredients'])) {
                foreach ($product['ingredients'] as $ingredient) {
                    if (isset($ingredient['name'])) {
                        $ingredientNames[$ingredient['name']] = $ingredient['image_url'] ?? null;
                    }
                }
            }
        }

        $map = [];

        foreach ($ingredientNames as $name => $imageUrl) {
            // Check if ingredient already exists
            $existing = DB::table('ingredients')
                ->where('name', $name)
                ->first();

            if ($existing) {
                $map[$name] = $existing->id;
                continue;
            }

            // Insert new ingredient
            $id = DB::table('ingredients')->insertGetId([
                'name' => $name,
                'image_url' => $imageUrl,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $map[$name] = $id;
        }

        return $map;
    }

    /**
     * Seed a single product with all related data
     */
    private function seedProduct(
        array $jsonProduct,
        string $catalogBrand,
        array $brandMap,
        array $categoryMap,
        array $productTypeMap,
        array $ingredientMap
    ): void {
        // Resolve per-product brand (fallback to catalog brand)
        $brandName = $jsonProduct['brand'] ?? $catalogBrand;
        $brandId   = $brandMap[$brandName] ?? ($brandMap[$catalogBrand] ?? 1);
        // Generate unique slug
        $baseSlug = Str::slug($jsonProduct['name']);
        $slug = $baseSlug;
        $counter = 1;

        while (DB::table('products')->where('slug', $slug)->exists()) {
            $slug = "{$baseSlug}-{$counter}";
            $counter++;
        }

        // Map gender value
        $genderMap = [
            'women' => 'women',
            'male' => 'men',
            'men' => 'men',
            'female' => 'women',
            'unisex' => 'unisex',
        ];
        $gender = $genderMap[$jsonProduct['gender'] ?? 'unisex'] ?? 'unisex';

        // Get category ID (brand_id already resolved above)
        $categoryId = $categoryMap[$jsonProduct['category']] ?? null;

        // Get product type ID
        $productTypeId = isset($jsonProduct['type_produit']) && isset($productTypeMap[$jsonProduct['type_produit']])
            ? $productTypeMap[$jsonProduct['type_produit']]
            : null;

        // Create product
        $productId = DB::table('products')->insertGetId([
            'brand_id' => $brandId,
            'category_id' => $categoryId,
            'product_type_id' => $productTypeId,
            'name' => $jsonProduct['name'],
            'slug' => $slug,
            'subtitle' => $jsonProduct['subtitle'] ?? null,
            'description' => $jsonProduct['description'] ?? null,
            'ingredients' => null, // Will be populated via ingredient_product relationship
            'gender' => $gender,
            'price' => $jsonProduct['price'] ?? 0,
            'original_price' => $jsonProduct['original_price'],
            'stock' => $jsonProduct['stock'] ?? 0,
            'is_active' => true,
            'is_featured' => false,
            'is_best_seller' => $jsonProduct['is_best_seller'] ?? false,
            'is_gift' => $jsonProduct['is_gift'] ?? false,
            'is_recommended' => $jsonProduct['is_recommended'] ?? false,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        // ════════════════════════════════════════════════════════════════
        // Seed Product Images
        // ════════════════════════════════════════════════════════════════
        if (isset($jsonProduct['img_main'])) {
            // Normalize image URL: ensure it starts with /images/
            $imgMainUrl = $jsonProduct['img_main'];
            if (!str_starts_with($imgMainUrl, '/')) {
                $imgMainUrl = '/images/' . $imgMainUrl;
            }

            // Insert main image
            DB::table('product_images')->insert([
                'product_id' => $productId,
                'url' => $imgMainUrl,
                'alt' => $jsonProduct['name'] . ' - Main Image',
                'sort_order' => 0,
                'is_primary' => true,
                'created_at' => now(),
            ]);

            // Scan the product folder for additional images
            $folderUrl   = dirname($imgMainUrl);                       // e.g. /images/Summer in Bali Body Butter
            $mainFile    = basename($imgMainUrl);                      // e.g. summer-in-bali-body-butter-img_main.png

            $folderFs = base_path('../frontend/Public') . str_replace('/', DIRECTORY_SEPARATOR, $folderUrl);

            if (is_dir($folderFs)) {
                $allowed  = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
                $sortOrder = 1;

                foreach (scandir($folderFs) as $file) {
                    if ($file === '.' || $file === '..' || $file === $mainFile) {
                        continue;
                    }
                    if (!in_array(strtolower(pathinfo($file, PATHINFO_EXTENSION)), $allowed)) {
                        continue;
                    }

                    DB::table('product_images')->insert([
                        'product_id' => $productId,
                        'url' => $folderUrl . '/' . $file,
                        'alt' => $jsonProduct['name'] . ' - Image ' . $sortOrder,
                        'sort_order' => $sortOrder,
                        'is_primary' => false,
                        'created_at' => now(),
                    ]);
                    $sortOrder++;
                }
            }
        }

        // ════════════════════════════════════════════════════════════════
        // Seed Product Variants
        // ════════════════════════════════════════════════════════════════
        if (isset($jsonProduct['variants']) && is_array($jsonProduct['variants'])) {
            $sortOrder = 0;
            foreach ($jsonProduct['variants'] as $variant) {
                DB::table('product_variants')->insert([
                    'product_id' => $productId,
                    'size' => $variant['size'] ?? 0,
                    'price' => $variant['price'] ?? $jsonProduct['price'] ?? 0,
                    'stock_quantity' => $variant['stock_quantity'] ?? $variant['stock'] ?? $jsonProduct['stock'] ?? 0,
                    'is_default' => $sortOrder === 0, // First variant is default
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                $sortOrder++;
            }
        }

        // ════════════════════════════════════════════════════════════════
        // Seed Product FAQs
        // ════════════════════════════════════════════════════════════════
        if (isset($jsonProduct['faqs']) && is_array($jsonProduct['faqs'])) {
            foreach ($jsonProduct['faqs'] as $faq) {
                DB::table('product_faqs')->insert([
                    'product_id' => $productId,
                    'question' => $faq['question'] ?? '',
                    'answer' => $faq['answer'] ?? '',
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        // ════════════════════════════════════════════════════════════════
        // Seed Ingredient Relationships
        // ════════════════════════════════════════════════════════════════
        if (isset($jsonProduct['ingredients']) && is_array($jsonProduct['ingredients'])) {
            $pivotData = [];
            foreach ($jsonProduct['ingredients'] as $ingredient) {
                if (isset($ingredient['name']) && isset($ingredientMap[$ingredient['name']])) {
                    $pivotData[] = [
                        'product_id' => $productId,
                        'ingredient_id' => $ingredientMap[$ingredient['name']],
                    ];
                }
            }

            if (!empty($pivotData)) {
                DB::table('ingredient_product')->insert($pivotData);
            }
        }
    }
}
