<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
use Illuminate\Support\Facades\DB;

// Find brands that differ only by case or minor formatting
$rows = DB::select('select id, name, slug from brands order by lower(name), id');
$map = [];
foreach ($rows as $r) {
    $key = mb_strtolower(trim($r->name));
    $map[$key][] = $r;
}

$dups = array_filter($map, fn($arr) => count($arr) > 1);
if (empty($dups)) {
    echo "No duplicate-brand groups found. Total brands: " . count($rows) . "\n";
    exit(0);
}

foreach ($dups as $key => $group) {
    echo "Group: '$key'\n";
    foreach ($group as $g) {
        echo "  - [{$g->id}] {$g->name} (slug: {$g->slug})\n";
    }
}

echo "\nYou can merge duplicates by running check_merge_brands.php with canonical id and comma list.\n";
