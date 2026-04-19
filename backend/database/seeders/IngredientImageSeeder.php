<?php

namespace Database\Seeders;

use App\Services\ImageService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Log;

class IngredientImageSeeder extends Seeder
{
    public function run(): void
    {
        $folder = base_path('../frontend/Public/INGRÉDIENTS');

        if (!File::isDirectory($folder)) {
            $this->command->warn("INGRÉDIENTS folder not found at: $folder");
            return;
        }

        $imageService = app(ImageService::class);
        $files = File::files($folder);
        $updated = 0;

        foreach ($files as $file) {
            $ext = strtolower($file->getExtension());
            if (!in_array($ext, ['jpg', 'jpeg', 'png', 'webp'], true)) {
                continue;
            }

            $name = $file->getFilenameWithoutExtension();

            $storedPath = '/INGRÉDIENTS/' . $file->getFilename(); // fallback
            try {
                $result = $imageService->process($file->getPathname(), 'ingredients');
                $storedPath = $result->relativePath;
            } catch (\Exception $e) {
                Log::warning("IngredientImageSeeder: Failed to process {$file->getFilename()}: {$e->getMessage()}");
            }

            $rows = DB::table('ingredients')->where('name', $name)->update(['image_url' => $storedPath]);
            if ($rows) {
                $updated++;
            }
        }

        $this->command->info("Updated $updated ingredient image URLs.");
    }
}
