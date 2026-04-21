#!/usr/bin/env php
<?php
// Run with: php artisan tinker < this file

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/bootstrap/app.php';

use App\Models\Product;

// Get all products with is_gift=true
$giftProducts = Product::where('is_gift', true)
    ->select('id', 'name', 'brand_id', 'category_id')
    ->orderBy('id')
    ->limit(100)
    ->get();

echo "=== Products with is_gift=true ===\n";
echo "Total count: " . $giftProducts->count() . "\n\n";

// Group by first 10 to see a pattern
foreach ($giftProducts->take(10) as $product) {
    echo "ID: {$product->id}, Name: {$product->name}\n";
}

// Check if there's a pattern (e.g., every Nth product, or specific brand/category)
if ($giftProducts->count() > 0) {
    echo "\n=== Analyzing pattern ===\n";
    $ids = $giftProducts->pluck('id')->toArray();
    echo "IDs: " . implode(', ', array_slice($ids, 0, 20)) . (count($ids) > 20 ? ', ...' : '') . "\n";
    
    // Check if it's every Nth product
    if (count($ids) > 1) {
        $diff = $ids[1] - $ids[0];
        $isPattern = true;
        for ($i = 1; $i < min(count($ids), 10); $i++) {
            if ($ids[$i] - $ids[$i-1] != $diff) {
                $isPattern = false;
                break;
            }
        }
        if ($isPattern) {
            echo "Pattern detected: Every {$diff}th product\n";
        }
    }
}

// Check specific products
echo "\n=== Checking specific products ===\n";
$histoire = Product::where('name', 'like', '%Histoire%')->first(['id', 'name', 'is_gift']);
if ($histoire) {
    echo "Histoire d'amour: ID={$histoire->id}, is_gift={$histoire->is_gift}\n";
}

// Check total count
$totalActive = Product::where('is_active', true)->count();
echo "\nTotal active products: {$totalActive}\n";
echo "Total with is_gift=true: " . Product::where('is_gift', true)->count() . "\n";
echo "Percentage: " . round(Product::where('is_gift', true)->count() / $totalActive * 100, 1) . "%\n";
