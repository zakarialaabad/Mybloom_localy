@echo off
REM PACK Filter Database Fix - Windows Batch Script
REM This script fixes the is_gift database values for Windows users

cd backend

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   PACK FILTER FIX - Windows Version                   ║
echo ╚════════════════════════════════════════════════════════╝
echo.

echo [STEP 1] Resetting database and fixing is_gift values...
echo.

REM Create a temporary PHP script to run
(
echo ^<?php
echo use App\Models\Product;
echo use Illuminate\Support\Facades\DB;
echo use Illuminate\Support\Facades\Artisan;
echo.
echo echo "Resetting all is_gift values to false...\n";
echo DB::table('products'^)^.update(['is_gift' =^> false]^);
echo echo "✓ Done\n\n";
echo.
echo echo "Finding and updating Histoire d'amour...\n";
echo $h = Product::where('name', 'like', '%%Histoire%%'^)^.first(^);
echo if ($h^) {
echo     DB::table('products'^)^.where('id', $h^-^>id^)^.update(['is_gift' =^> true]^);
echo     echo "✓ Updated product ID " . $h^-^>id . "\n";
echo } else {
echo     echo "✗ Product not found\n";
echo }
echo.
echo echo "Clearing caches...\n";
echo try {
echo     Artisan::call('cache:clear'^);
echo     echo "✓ Cache cleared\n";
echo } catch (Exception $e^) {
echo     echo "Cache error: " . $e^-^>getMessage(^) . "\n";
echo }
echo.
echo $count = Product::where('is_gift', true'^)^.count(^);
echo echo "Verification: " . $count . " products with is_gift=true\n";
echo if ($count === 1^) {
echo     echo "✅ SUCCESS!\n";
echo } else {
echo     echo "❌ ERROR: Expected 1, got " . $count . "\n";
echo }
) > fix-temp.php

REM Run the script
php artisan tinker --execute="include 'fix-temp.php';"

REM Alternative: use php directly
REM php fix-temp.php

REM Cleanup
del fix-temp.php

echo.
echo [STEP 2] Verification...
echo.

REM Test the API endpoint
echo Testing API endpoint...
echo curl "http://localhost:8000/api/v1/products/test/is-gift?is_gift=1"
echo (Open this URL in browser or run via PowerShell curl^)
echo.

echo.
echo ╔════════════════════════════════════════════════════════╗
echo ║   FIX COMPLETE! Test the PACK tab                     ║
echo ╚════════════════════════════════════════════════════════╝
echo.
echo Next: Click PACK tab at http://localhost:3000
echo Expected: Only "Histoire d'amour" product shows
echo.

pause
