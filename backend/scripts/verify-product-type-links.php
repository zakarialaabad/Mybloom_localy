<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
use Illuminate\Support\Facades\DB;

$total = DB::table('products')->count();
echo "Total products in DB: $total\n\n";
$grouped = DB::table('products')
    ->join('product_types','products.product_type_id','=','product_types.id')
    ->select('product_types.name', DB::raw('count(*) as total'))
    ->groupBy('product_types.id','product_types.name')
    ->orderBy('total','desc')
    ->get();

if ($grouped->isEmpty()) { echo "No product->type links found.\n"; exit(0); }
foreach ($grouped as $g) {
    echo "{$g->name}: {$g->total}\n";
}

// show sample products with their type name
echo "\nSample products with types:\n";
$samples = DB::table('products')
    ->join('product_types','products.product_type_id','=','product_types.id')
    ->select('products.id','products.name','product_types.name as type')
    ->limit(10)
    ->get();
foreach ($samples as $s) {
    echo "[{$s->id}] {$s->name} -> {$s->type}\n";
}
