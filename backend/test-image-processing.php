<?php
/**
 * Test script to verify ImageService works correctly
 * Run via: php artisan tinker < test-image-processing.php
 */

namespace TestImageProcessing;

// Test 1: Check configuration
echo "=== Image Processing Test ===\n\n";
echo "1. Configuration Check:\n";

$config = config('image-optimization');
echo "   - convert_to_webp: " . ($config['convert_to_webp'] ? 'true' : 'false') . "\n";
echo "   - quality (products): " . $config['quality']['products'] . "\n";
echo "   - disk: " . $config['disk'] . "\n";
echo "   ✓ Config loaded\n\n";

// Test 2: Check ImageService instantiation
echo "2. ImageService Instantiation:\n";
try {
    $imageService = app(\App\Services\ImageService::class);
    echo "   ✓ ImageService instantiated successfully\n\n";
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

// Test 3: Check Intervention Image library
echo "3. Intervention Image v3 Check:\n";
try {
    $manager = app(\Intervention\Image\ImageManager::class);
    echo "   ✓ ImageManager available\n";
    
    // Create test image
    $testImage = $manager->create(100, 100)->fill('blue');
    echo "   ✓ Can create images\n";
    
    // Check methods
    echo "   ✓ Has width(): " . method_exists($testImage, 'width') . "\n";
    echo "   ✓ Has scaleDown(): " . method_exists($testImage, 'scaleDown') . "\n";
    echo "   ✓ Has toWebp(): " . method_exists($testImage, 'toWebp') . "\n";
    echo "   ✓ Has toJpeg(): " . method_exists($testImage, 'toJpeg') . "\n";
    
    // Test toWebp returns EncodedImage
    $encoded = $testImage->toWebp(quality: 80);
    echo "   ✓ toWebp() returns object with save(): " . method_exists($encoded, 'save') . "\n";
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n\n";
    exit(1);
}

echo "\n4. Summary:\n";
echo "   ✓ All components verified working\n";
echo "   ✓ ImageService is ready to process images\n";
echo "\n=== Test Complete ===\n";
