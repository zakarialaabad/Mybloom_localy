<?php

// Normalizes fragrance-related product types in products.json
// - Replaces 'Parfum' and any type containing fragrance keywords with 'Eau de Parfum'
// - Writes a backup to products.json.bak

$path = __DIR__ . '/../database/seeders/products.json';
if (!file_exists($path)) {
    echo "products.json not found at $path\n";
    exit(1);
}

$contents = file_get_contents($path);
$data = json_decode($contents, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    echo "JSON parse error: " . json_last_error_msg() . "\n";
    exit(1);
}

$fragranceKeywords = [
  'Floral', 'Oriental', 'Fruité', 'Gourmand', 'Chypré',
  'Ambré', 'Aromatique', 'Aquatique', 'Aldéhydé',
  'Boisé', 'Blanc', 'Musqué', 'Épicé', 'Fougère'
];

$patternKeywords = array_map(function($k){
    // escape and allow accented variants by matching base letters with optional accents
    // keep simple: use stripos on original strings
    return $k;
}, $fragranceKeywords);

$products = &$data['catalog']['products'];
$changed = 0;
$replacedList = [];

foreach ($products as &$p) {
    $orig = isset($p['type_produit']) ? $p['type_produit'] : null;
    if ($orig === null) continue;

    $new = $orig;

    // If exact 'Parfum' (case-insensitive) => Eau de Parfum
    if (mb_strtolower(trim($orig)) === mb_strtolower('Parfum')) {
        $new = 'Eau de Parfum';
    }

    // If contains any fragrance keyword (case-insensitive), replace
    foreach ($patternKeywords as $kw) {
        // Use mb_stripos for case-insensitive substring search
        if (mb_stripos($orig, $kw) !== false) {
            $new = 'Eau de Parfum';
            break;
        }
    }

    // Additional rule from user: If brand exists and different from 'My Bloom' and type contains keywords -> Eau de Parfum
    if (isset($p['brand']) && mb_strtolower(trim($p['brand'])) !== mb_strtolower('My Bloom')) {
        foreach ($patternKeywords as $kw) {
            if (mb_stripos($orig, $kw) !== false) {
                $new = 'Eau de Parfum';
                break;
            }
        }
        if (mb_strtolower(trim($orig)) === mb_strtolower('Parfum')) {
            $new = 'Eau de Parfum';
        }
    }

    if ($new !== $orig) {
        $p['type_produit'] = $new;
        $changed++;
        $replacedList[] = [ 'id' => ($p['id'] ?? null), 'name' => ($p['name'] ?? null), 'from' => $orig, 'to' => $new ];
    }
}

// Backup original
$bak = $path . '.bak.' . date('Ymd_His');
file_put_contents($bak, $contents);
file_put_contents($path, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

echo "Updated products.json: $changed items changed. Backup saved to: $bak\n";
if ($changed > 0) {
    echo "Sample replacements:\n";
    $sample = array_slice($replacedList, 0, 10);
    foreach ($sample as $r) {
        echo "  id:" . $r['id'] . " name:'" . $r['name'] . "' => '" . $r['from'] . "' -> '" . $r['to'] . "'\n";
    }
}

exit(0);
