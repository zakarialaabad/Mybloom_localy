<?php

$seedersPath = __DIR__ . '/products.json';
$dbPath = dirname(__DIR__) . '/products.json';

// Read the JSON
$content = file_get_contents($seedersPath);

// Fix all mybloom parfum paths
$fixed = str_replace(
    '"img_main": "mybloom parfum/',
    '"img_main": "/images/mybloom parfum/',
    $content
);

// Write back
file_put_contents($seedersPath, $fixed);
file_put_contents($dbPath, $fixed);

// Verify
$mybloomCount = substr_count($fixed, '"/images/mybloom parfum/');
echo "✓ Fixed image paths\n";
echo "  - Mybloom images fixed: {$mybloomCount}\n";
echo "✓ Files updated\n";
