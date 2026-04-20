<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
use Illuminate\Support\Facades\DB;

function normalize_name($name) {
    $name = trim(mb_strtolower($name));
    // transliterate accents
    $name = iconv('UTF-8', 'ASCII//TRANSLIT', $name) ?: $name;
    // remove non-alphanumeric
    $name = preg_replace('/[^a-z0-9]+/', '', $name);
    return $name;
}

$rows = DB::select('select id, name, slug from brands order by id');
$map = [];
foreach ($rows as $r) {
    $key = normalize_name($r->name);
    $map[$key][] = $r;
}

$dups = array_filter($map, fn($arr) => count($arr) > 1);
if (empty($dups)) {
    echo "No normalized duplicate-brand groups found. Total brands: " . count($rows) . "\n";
    exit(0);
}

foreach ($dups as $key => $group) {
    echo "Group key: '$key'\n";
    foreach ($group as $g) {
        echo "  - [{$g->id}] {$g->name} (slug: {$g->slug})\n";
    }
    echo "\n";
}

echo "Run scripts/auto_merge_brands.php to merge groups automatically (careful).\n";
