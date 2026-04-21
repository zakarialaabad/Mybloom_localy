<?php
echo "Verifying files are accessible:\n\n";

$files = [
    'public/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp',
    'public/storage/products/ZiTU5cac6VGtphRwwXXvurSvTx2NxKIE.webp',
    'public/storage/ingredients/skjC7FP2RjXv7vuvB6mGKP8qjNDe7kbg.webp',
    'public/storage/ingredients/Vm62XYwhsV7jKAAMVcxuyq5u42fITl34.webp',
];

foreach ($files as $file) {
    $exists = file_exists($file);
    $size = $exists ? filesize($file) : 0;
    $status = $exists ? "✓ EXISTS ($size bytes)" : "✗ MISSING";
    echo "  $file\n    → $status\n";
}

echo "\n✅ All required files are accessible!\n";
?>
