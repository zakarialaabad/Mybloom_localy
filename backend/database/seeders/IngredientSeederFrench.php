<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class IngredientSeederFrench extends Seeder
{
    /**
     * Seed the ingredients table with exact French ingredients
     * and images from public/ingredients folder
     */
    public function run(): void
    {
        $ingredientNames = [
            'Mangue',
            'Vanille',
            'Noix de coco',
            'Aloe vera',
            'Pépins de raisin',
            'Sésame',
            'Amande',
            'Jojoba',
            'Arbre à thé',
            'Oliban',
            'Eau de rose distillée',
            'Avocat',
            'Karité',
            'Cacao',
        ];

        // Images live in the Next.js public folder: frontend/Public/INGRÉDIENTS/{name}.png
        $frontendIngredientDir = base_path('../frontend/Public/INGRÉDIENTS');
        $insertedCount = 0;

        foreach ($ingredientNames as $ingredientName) {
            // Build the web-accessible URL for this ingredient image
            $imageUrl = $this->getIngredientImageUrl($ingredientName, $frontendIngredientDir);

            // Check if ingredient already exists
            $existing = DB::table('ingredients')
                ->where('name', $ingredientName)
                ->first();

            if ($existing) {
                // Update image_url if it is still null (first-time fix)
                if ($existing->image_url === null && $imageUrl !== null) {
                    DB::table('ingredients')->where('id', $existing->id)->update(['image_url' => $imageUrl]);
                    $this->command->info("🔄 Updated image for: {$ingredientName} → {$imageUrl}");
                } else {
                    $this->command->info("⏭️  Skipping existing ingredient: {$ingredientName}");
                }
                continue;
            }

            // Insert ingredient
            DB::table('ingredients')->insert([
                'name' => $ingredientName,
                'image_url' => $imageUrl,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $insertedCount++;
            $this->command->info("✅ Created: {$ingredientName}" . ($imageUrl ? " (image: {$imageUrl})" : " (no image found)"));
        }

        $this->command->info("✅ Ingredients seeded: {$insertedCount} new ingredients added");
    }

    /**
     * Get the web URL for an ingredient image.
     * Images live as flat PNG files: frontend/Public/INGRÉDIENTS/{name}.png
     */
    private function getIngredientImageUrl(string $ingredientName, string $ingredientDir): ?string
    {
        foreach (['png', 'jpg', 'jpeg', 'webp'] as $ext) {
            $file = $ingredientDir . DIRECTORY_SEPARATOR . $ingredientName . '.' . $ext;
            if (file_exists($file)) {
                // URL-encode only the folder name (has accent), keep filename readable
                return '/INGRÉDIENTS/' . $ingredientName . '.' . $ext;
            }
        }

        $this->command->warn("⚠️  No image found for: {$ingredientName}");
        return null;
    }
}
