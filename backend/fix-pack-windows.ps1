# PACK Filter Database Fix - PowerShell Version
# Run this in PowerShell: .\fix-pack-windows.ps1

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   PACK FILTER FIX - PowerShell Version                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# Navigate to backend
Set-Location backend

# Step 1: Verify we're in the right place
if (-not (Test-Path "artisan")) {
    Write-Host "❌ Error: artisan not found. Are you in the backend directory?" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 1] Checking current database state..." -ForegroundColor Cyan
Write-Host ""

# Run tinker command to reset
Write-Host "Executing database fix via artisan tinker..." -ForegroundColor Yellow
Write-Host ""

$tinkerCode = @'
use App\Models\Product;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

echo "╔════════════════════════════════════════════════════════╗\n";
echo "║   DATABASE FIX IN PROGRESS                            ║\n";
echo "╚════════════════════════════════════════════════════════╝\n\n";

// Get before state
$before = Product::where('is_gift', true)->count();
echo "[BEFORE] Products with is_gift=true: $before\n\n";

// Reset all to false
echo "Step 1: Resetting all products to is_gift=false...\n";
$updated = DB::table('products')->update(['is_gift' => false]);
echo "✓ Updated $updated products\n\n";

// Find and update Histoire d'amour
echo "Step 2: Finding 'Histoire d'amour'...\n";
$h = Product::where('name', 'like', '%Histoire%')->first();
if ($h) {
    echo "✓ Found: ID {$h->id}, Name: {$h->name}\n";
    DB::table('products')->where('id', $h->id)->update(['is_gift' => true]);
    echo "✓ Updated is_gift to TRUE\n\n";
} else {
    echo "✗ ERROR: Product not found!\n\n";
}

// Clear caches
echo "Step 3: Clearing caches...\n";
try {
    Artisan::call('cache:clear');
    echo "✓ Cache cleared\n";
    Artisan::call('view:clear');
    echo "✓ View cache cleared\n";
} catch (Exception $e) {
    echo "⚠ Cache error (non-critical): " . $e->getMessage() . "\n";
}

echo "\n";

// Verification
$after = Product::where('is_gift', true)->count();
$histoire = Product::where('name', 'like', '%Histoire%')->first(['is_gift']);

echo "╔════════════════════════════════════════════════════════╗\n";
echo "║   VERIFICATION RESULTS                                ║\n";
echo "╚════════════════════════════════════════════════════════╝\n\n";
echo "[AFTER] Products with is_gift=true: $after\n";
if ($histoire) {
    echo "Histoire d'amour is_gift: " . ($histoire->is_gift ? 'TRUE ✓' : 'FALSE ✗') . "\n";
}

if ($after === 1 && $histoire && $histoire->is_gift) {
    echo "\n✅ SUCCESS! Database is now FIXED!\n";
} else {
    echo "\n❌ ERROR: Database fix incomplete\n";
}

echo "\n";
'@

# Write tinker code to a file
$tinkerCode | Out-File -Encoding UTF8 "tinker-fix.php"

# Run it using artisan tinker
& php artisan tinker --execute="include 'tinker-fix.php';"

# Cleanup
Remove-Item "tinker-fix.php" -Force

Write-Host ""
Write-Host "[STEP 2] Now testing API..." -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing API endpoint..." -ForegroundColor Yellow
Write-Host "URL: http://localhost:8000/api/v1/products?is_gift=1" -ForegroundColor White
Write-Host ""
Write-Host "Running curl..." -ForegroundColor Yellow

try {
    $response = curl.exe "http://localhost:8000/api/v1/products?is_gift=1" 2>$null
    if ($response) {
        # Parse JSON to count products
        $json = $response | ConvertFrom-Json
        $count = $json.data.Count
        Write-Host "✓ API returned: $count product(s)" -ForegroundColor Green
        if ($count -eq 1) {
            Write-Host "✓ Correct! Only 1 product returned" -ForegroundColor Green
        } else {
            Write-Host "⚠ Warning: Expected 1 product, got $count" -ForegroundColor Yellow
        }
    }
} catch {
    Write-Host "⚠ Could not test API (is server running?)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║   FIX COMPLETE! Testing in Browser...                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "──────────────────────────────────────────────────────"
Write-Host "1. Open browser: http://localhost:3000" -ForegroundColor White
Write-Host "2. Click PACK tab in header" -ForegroundColor White
Write-Host "3. Verify only 'Histoire d'amour' is displayed" -ForegroundColor White
Write-Host ""
Write-Host "Expected result:" -ForegroundColor Yellow
Write-Host "  - URL: http://localhost:3000/collection?is_gift=true" -ForegroundColor White
Write-Host "  - Display: Only 1 product" -ForegroundColor White
Write-Host "  - Product name: Histoire d'amour" -ForegroundColor White
Write-Host ""
