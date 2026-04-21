#!/usr/bin/env php
<?php
/**
 * CRITICAL FIX: Reset is_gift values in database to match products.json
 * Run: php artisan tinker < backend/fix-is-gift-database.php
 * OR: php backend/fix-is-gift-database.php  (if not in tinker)
 */

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/bootstrap/app.php';

use App\Models\Product;
use Illuminate\Support\Facades\DB;

echo "╔════════════════════════════════════════════════════════╗\n";
echo "║        FIX: Reset is_gift values in database            ║\n";
echo "╚════════════════════════════════════════════════════════╝\n\n";

// Step 1: Check current state
$beforeGiftCount = Product::where('is_gift', true)->count();
$beforeTotal = Product::where('is_active', true)->count();

echo "[BEFORE]\n";
echo "  Products with is_gift=true: {$beforeGiftCount}\n";
echo "  Total active products: {$beforeTotal}\n";
echo "  Percentage: " . round($beforeGiftCount / $beforeTotal * 100, 1) . "%\n\n";

// Step 2: Set ALL products is_gift to FALSE (reset)
echo "[STEP 1] Setting all products is_gift=false...\n";
DB::table('products')->update(['is_gift' => false]);
echo "  ✓ Done!\n\n";

// Step 3: Find and update "Histoire d'amour" to is_gift=true
echo "[STEP 2] Finding 'Histoire d'amour' product...\n";
$histoireProduct = Product::where('name', 'like', '%Histoire%')
    ->where('name', 'like', '%amour%')
    ->first();

if ($histoireProduct) {
    echo "  ✓ Found: ID={$histoireProduct->id}, Name='{$histoireProduct->name}'\n";
    
    DB::table('products')
        ->where('id', $histoireProduct->id)
        ->update(['is_gift' => true]);
    
    echo "  ✓ Updated is_gift to true!\n\n";
} else {
    echo "  ✗ WARNING: Could not find 'Histoire d'amour' product!\n\n";
}

// Step 4: Verify the fix
$afterGiftCount = Product::where('is_gift', true)->count();
$afterHistoire = Product::where('name', 'like', '%Histoire%')->first(['is_gift']);

echo "[AFTER]\n";
echo "  Products with is_gift=true: {$afterGiftCount}\n";
echo "  Histoire d'amour is_gift value: " . ($afterHistoire->is_gift ? 'TRUE' : 'FALSE') . "\n";
echo "  Total active products: " . Product::where('is_active', true)->count() . "\n\n";

// Step 5: Verification test
if ($afterGiftCount === 1 && $afterHistoire->is_gift) {
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║   ✅  DATABASE FIX SUCCESSFUL!                          ║\n";
    echo "║   Only 1 product has is_gift=true (Histoire d'amour)   ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n";
} else {
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║   ❌  DATABASE FIX INCOMPLETE                           ║\n";
    echo "║   Expected: 1 product with is_gift=true                ║\n";
    echo "║   Got: {$afterGiftCount} products with is_gift=true              ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n";
}

// Clear cache
echo "\n[CLEANUP] Clearing caches...\n";
Artisan::call('cache:clear');
Artisan::call('view:clear');
echo "  ✓ Caches cleared!\n";

echo "\n✨ Fix complete! The PACK filter should now work correctly.\n";
echo "Next: Test by visiting http://localhost:3000/collection?is_gift=true\n";
