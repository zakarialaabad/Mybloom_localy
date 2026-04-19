<?php

require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

use Illuminate\Support\Facades\DB;

try {
    $total = DB::table('products')->count();
    echo "✅ Total Products: $total\n\n";
    
    $by_type = DB::table('products')
        ->join('product_types', 'products.product_type_id', '=', 'product_types.id')
        ->select('product_types.name', DB::raw('count(*) as count'))
        ->groupBy('product_types.id', 'product_types.name')
        ->orderBy('count', 'desc')
        ->get();
    
    echo "📊 Products by Type:\n";
    foreach ($by_type as $row) {
        echo "  {$row->name}: {$row->count}\n";
    }
    
    $sample = DB::table('products')->select('id', 'name', 'product_type_id')->limit(3)->get();
    echo "\n📝 Sample Products:\n";
    foreach ($sample as $p) {
        echo "  ID {$p->id}: {$p->name} (type_id: {$p->product_type_id})\n";
    }
    
} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
    exit(1);
}
