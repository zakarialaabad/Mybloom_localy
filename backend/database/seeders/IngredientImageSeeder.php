<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class IngredientImageSeeder extends Seeder
{
    public function run(): void
    {
        // Scan frontend/Public/INGRÉDIENTS for image files and map them to DB ingredients
        $folder = base_path('../frontend/Public/INGRÉDIENTS');

        if (!File::isDirectory($folder)) {
            $this->command->warn("INGRÉDIENTS folder not found at: $folder");
            return;
        }

        $files = File::files($folder);
        $updated = 0;

        foreach ($files as $file) {
            $ext = strtolower($file->getExtension());
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                continue;
            }

            // Name in folder = ingredient name without extension (e.g. "Sésame")
            $name = $file->getFilenameWithoutExtension();
            $filename = $file->getFilename();

            // Path served by Next.js from its public folder
            $path = '/INGRÉDIENTS/' . $filename;

            $rows = DB::table('ingredients')->where('name', $name)->update(['image_url' => $path]);
            if ($rows) {
                $updated++;
            }
        }

        $this->command->info("Updated $updated ingredient image URLs.");
    }
}
