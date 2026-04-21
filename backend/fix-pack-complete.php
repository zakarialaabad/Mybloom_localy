#!/usr/bin/env php
<?php
/**
 * PACK FILTER DATABASE COMPLETE FIX
 * Run: php artisan tinker < backend/fix-pack-complete.php
 */

use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

echo "\n╔════════════════════════════════════════════════════════╗\n";
echo "║   PACK FILTER FIX - Complete Database Restoration      ║\n";
echo "╚════════════════════════════════════════════════════════╝\n\n";

// ════════════════════════════════════════════════════════════════════════
// STEP 1: Show current state
// ════════════════════════════════════════════════════════════════════════
echo "[STEP 1] Current Database State\n";
echo "──────────────────────────────────────────────────────────\n";

$giftCountBefore = Product::where('is_gift', true)->count();
$totalCount = Product::count();

echo "  Total products in database: {$totalCount}\n";
echo "  Products with is_gift=true: {$giftCountBefore}\n";
echo "  Percentage: " . round($giftCountBefore / $totalCount * 100, 1) . "%\n";
echo "  ⚠ This is WRONG - should be only 1 product\n\n";

// ════════════════════════════════════════════════════════════════════════
// STEP 2: Reset ALL is_gift values to false
// ════════════════════════════════════════════════════════════════════════
echo "[STEP 2] Resetting all is_gift values to false\n";
echo "──────────────────────────────────────────────────────────\n";

$updated = DB::table('products')->update(['is_gift' => false]);
echo "  ✓ Updated {$updated} products\n";
echo "  ✓ All products now have is_gift=false\n\n";

// ════════════════════════════════════════════════════════════════════════
// STEP 3: Set ONLY "Histoire d'amour" to is_gift=true
// ════════════════════════════════════════════════════════════════════════
echo "[STEP 3] Finding and updating 'Histoire d'amour'\n";
echo "──────────────────────────────────────────────────────────\n";

$histoireProduct = Product::where('name', 'like', '%Histoire%')->first();

if ($histoireProduct) {
    echo "  ✓ Found product:\n";
    echo "    - ID: {$histoireProduct->id}\n";
    echo "    - Name: {$histoireProduct->name}\n";
    
    DB::table('products')
        ->where('id', $histoireProduct->id)
        ->update(['is_gift' => true]);
    
    echo "  ✓ Updated is_gift to TRUE\n\n";
} else {
    echo "  ✗ ERROR: Could not find 'Histoire d'amour' product\n\n";
}

// ════════════════════════════════════════════════════════════════════════
// STEP 4: Clear caches
// ════════════════════════════════════════════════════════════════════════
echo "[STEP 4] Clearing application caches\n";
echo "──────────────────────────────────────────────────────────\n";

try {
    Artisan::call('cache:clear');
    echo "  ✓ Application cache cleared\n";
    
    Artisan::call('view:clear');
    echo "  ✓ View cache cleared\n";
    
    Artisan::call('config:clear');
    echo "  ✓ Config cache cleared\n";
} catch (\Exception $e) {
    echo "  ⚠ Cache clear error (non-critical): {$e->getMessage()}\n";
}

echo "\n";

// ════════════════════════════════════════════════════════════════════════
// STEP 5: Verify the fix
// ════════════════════════════════════════════════════════════════════════
echo "[STEP 5] Verifying Database Fix\n";
echo "──────────────────────────────────────────────────────────\n";

$giftCountAfter = Product::where('is_gift', true)->count();
$histoireAfter = Product::where('name', 'like', '%Histoire%')->first(['id', 'name', 'is_gift']);

echo "  After fix:\n";
echo "    - Total products: " . Product::count() . "\n";
echo "    - Products with is_gift=true: {$giftCountAfter}\n";

if ($histoireAfter) {
    echo "    - Histoire d'amour is_gift: " . ($histoireAfter->is_gift ? 'TRUE ✓' : 'FALSE ✗') . "\n";
}

echo "\n";

// ════════════════════════════════════════════════════════════════════════
// FINAL RESULT
// ════════════════════════════════════════════════════════════════════════
if ($giftCountAfter === 1 && $histoireAfter && $histoireAfter->is_gift) {
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║   ✅ DATABASE FIX SUCCESSFUL!                          ║\n";
    echo "║   Only 1 product has is_gift=true                     ║\n";
    echo "║   (Histoire d'amour)                                   ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n";
} else {
    echo "╔════════════════════════════════════════════════════════╗\n";
    echo "║   ⚠ FIX INCOMPLETE - Please check results above       ║\n";
    echo "╚════════════════════════════════════════════════════════╝\n";
}

echo "\n";
echo "NEXT STEPS:\n";
echo "─────────────────────────────────────────────────────────\n";
echo "1. Test the API directly:\n";
echo "   curl \"http://localhost:8000/api/v1/products?is_gift=1\"\n";
echo "   (Should return only 1 product)\n\n";
echo "2. Test in the browser:\n";
echo "   http://localhost:3000/collection?is_gift=true\n";
echo "   (Should show only Histoire d'amour)\n\n";
echo "3. Click PACK tab in header\n";
echo "   (Should show only 1 product)\n\n";
echo "If still not working:\n";
echo "  - Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)\n";
echo "  - Restart frontend: npm run dev\n";
echo "  - Check browser console for errors\n";
echo "\n";
