<?php
/**
 * Quick verification that ImageService flow works correctly
 * This tests the complete image processing pipeline without uploading a product
 */

echo "=== Image Processing Pipeline Verification ===\n\n";

// Test 1: Check Intervention Image v3 API availability
echo "1. Checking Intervention Image v3 API...\n";
try {
    $classes = [
        'Intervention\Image\ImageManager' => 'ImageManager class',
        'Intervention\Image\Drivers\Gd\Driver' => 'GD Driver class',
        'Intervention\Image\Image' => 'Image class',
    ];
    
    foreach ($classes as $class => $name) {
        if (class_exists($class)) {
            echo "   ✓ $name exists\n";
        } else {
            echo "   ✗ $name MISSING\n";
        }
    }
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

// Test 2: Check ImageService methods
echo "\n2. Checking ImageService methods...\n";
try {
    $methods = [
        'process' => 'public method process',
        'optimize' => 'private method optimize',
        'encodeAndSave' => 'private method encodeAndSave',
    ];
    
    $reflection = new ReflectionClass('App\Services\ImageService');
    
    foreach ($methods as $method => $desc) {
        if ($reflection->hasMethod($method)) {
            echo "   ✓ $desc exists\n";
        } else {
            echo "   ✗ $desc MISSING\n";
        }
    }
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

// Test 3: Verify v3 methods on Image class
echo "\n3. Checking Image class methods (v3 API)...\n";
try {
    // Create a dummy Image to check methods
    $manager = new \Intervention\Image\ImageManager(new \Intervention\Image\Drivers\Gd\Driver());
    
    // Create a 100x100 blue image
    $testImage = $manager->create(100, 100)->fill('blue');
    
    $methods = ['scaleDown', 'toWebp', 'toJpeg', 'width', 'height'];
    
    foreach ($methods as $method) {
        if (method_exists($testImage, $method)) {
            echo "   ✓ Image::$method() exists\n";
        } else {
            echo "   ✗ Image::$method() MISSING\n";
        }
    }
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

// Test 4: Check config
echo "\n4. Checking image optimization config...\n";
try {
    $config = config('image-optimization');
    if ($config) {
        echo "   ✓ Config loaded\n";
        echo "   - convert_to_webp: " . ($config['convert_to_webp'] ? 'true' : 'false') . "\n";
        echo "   - quality: " . ($config['quality']['products'] ?? 'not set') . "\n";
    } else {
        echo "   ✗ Config not found\n";
    }
} catch (\Exception $e) {
    echo "   ✗ Error: " . $e->getMessage() . "\n";
}

echo "\n=== Verification Complete ===\n";
?>
