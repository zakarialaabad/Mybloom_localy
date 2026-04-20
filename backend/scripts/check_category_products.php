<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
use Illuminate\Support\Facades\DB;

$slug = $argv[1] ?? 'beurre';

$cat = DB::table('categories')->where('slug', $slug)->first();
if (! $cat) { echo "Category slug '$slug' not found\n"; exit(1); }

$products = DB::table('products')->where('category_id', $cat->id)->get();
echo "Category: {$cat->id} {$cat->slug} ({$cat->name})\n";
echo "Products count: " . count($products) . "\n";
foreach ($products as $p) {
    echo "[{$p->id}] {$p->name} (slug: {$p->slug})\n";
}
