<?php
echo "=== SYMLINK DIAGNOSTIC ===\n\n";

$file = 'storage/app/public/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp';
$symlink_file = 'public/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp';

echo "1. Direct file in storage/app/public:\n";
echo "   Path: $file\n";
echo "   Exists: " . (file_exists($file) ? 'YES' : 'NO') . "\n";
if (file_exists($file)) {
    echo "   Size: " . filesize($file) . " bytes\n";
    echo "   Readable: " . (is_readable($file) ? 'YES' : 'NO') . "\n";
}
echo "\n";

echo "2. File through symlink:\n";
echo "   Path: $symlink_file\n";
echo "   Exists: " . (file_exists($symlink_file) ? 'YES' : 'NO') . "\n";
if (file_exists($symlink_file)) {
    echo "   Size: " . filesize($symlink_file) . " bytes\n";
    echo "   Readable: " . (is_readable($symlink_file) ? 'YES' : 'NO') . "\n";
}
echo "\n";

echo "3. Symlink details:\n";
if (is_link('public/storage')) {
    echo "   Symlink EXISTS: YES\n";
    echo "   Target: " . readlink('public/storage') . "\n";
} else {
    echo "   Symlink EXISTS: NO\n";
}
echo "\n";

echo "4. Test HTTP request:\n";
echo "   URL: http://127.0.0.1:8000/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp\n";

// Test with curl
$ch = curl_init('http://127.0.0.1:8000/storage/products/gSKJ0JSxhxrM16BPoperM0SRoetI0rWn.webp');
curl_setopt($ch, CURLOPT_NOBODY, true);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 3);

if (@curl_exec($ch)) {
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    echo "   HTTP Status: $status\n";
    if ($status == 200) {
        $size = curl_getinfo($ch, CURLINFO_CONTENT_LENGTH_DOWNLOAD);
        echo "   File Size: " . ($size > 0 ? $size . " bytes" : "Unknown") . "\n";
    }
} else {
    echo "   Error: " . curl_error($ch) . "\n";
}
curl_close($ch);
?>
