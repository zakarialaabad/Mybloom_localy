<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make(\Illuminate\Contracts\Console\Kernel::class)->bootstrap();

echo "Direct file system checks:\n\n";

$checks = [
    'storage/app/public/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp' => 'File in storage',
    'public/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp' => 'File via symlink',
];

foreach ($checks as $path => $label) {
    $exists = file_exists($path);
    $readable = is_readable($path);
    $size = $exists ? filesize($path) : 0;
    echo "✓ $label:\n";
    echo "  Path: $path\n";
    echo "  Exists: " . ($exists ? 'YES' : 'NO') . "\n";
    echo "  Readable: " . ($readable ? 'YES' : 'NO') . "\n";
    echo "  Size: " . ($size > 0 ? "$size bytes" : 'N/A') . "\n\n";
}

// Check symlink details
echo "Symlink Details:\n";
if (is_link('public/storage')) {
    $target = readlink('public/storage');
    echo "  Symlink exists: YES\n";
    echo "  Points to: $target\n";
    echo "  Target exists: " . (is_dir($target) ? 'YES' : 'NO') . "\n";
} else {
    echo "  Symlink exists: NO\n";
}

// Test Laravel Storage facade
echo "\nLaravel Storage Facade:\n";
$disk = \Illuminate\Support\Facades\Storage::disk('public');
echo "  Disk: public\n";
echo "  Root: " . $disk->path('') . "\n";
$exists = $disk->exists('products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp');
echo "  File visible via Storage: " . ($exists ? 'YES' : 'NO') . "\n";
?>
