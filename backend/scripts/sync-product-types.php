<?php

// Sync product_types table to keep only allowed core types + 'Eau de Parfum'

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

$allowed = [
    'Body Butter', 'Body Scrub', 'Tint Visage', 'Hair Mist', 'Body Mist',
    'Déodorant', 'Crème Parfumée', 'Diffuseur', "Spray d'Intérieur",
    'Coffret Cadeau', 'Huile Parfumée', 'Eau de Parfum'
];

$fragranceKeywords = [
  'Floral', 'Oriental', 'Fruité', 'Gourmand', 'Chypré',
  'Ambré', 'Aromatique', 'Aquatique', 'Aldéhydé',
  'Boisé', 'Blanc', 'Musqué', 'Épicé', 'Fougère'
];

// Ensure allowed types exist
foreach ($allowed as $name) {
    $slug = strtolower(str_replace(' ', '_', preg_replace('/[^A-Za-z0-9 _\'"éèàâêîôûçäëïöü-]/u','', $name)));
    $exists = DB::table('product_types')->where('name', $name)->orWhere('slug', $slug)->first();
    if (!$exists) {
        DB::table('product_types')->insert([
            'name' => $name,
            'slug' => $slug,
            'sort_order' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
        echo "Inserted type: $name\n";
    }
}

// Remove product types that are fragrance-classifications or 'Parfum' (but keep allowed)
$all = DB::table('product_types')->get();
$deleted = 0;
foreach ($all as $row) {
    if (in_array($row->name, $allowed)) continue;
    $lower = mb_strtolower($row->name);
    $shouldDelete = false;
    if (mb_strtolower($row->name) === 'parfum' || mb_strtolower($row->name) === 'parfums') {
        $shouldDelete = true;
    }
    foreach ($fragranceKeywords as $kw) {
        if (mb_stripos($row->name, $kw) !== false) {
            $shouldDelete = true;
            break;
        }
    }
    if ($shouldDelete) {
        DB::table('product_types')->where('id', $row->id)->delete();
        echo "Deleted type: {$row->name}\n";
        $deleted++;
    }
}

echo "Sync complete. Deleted: $deleted\n";

exit(0);
