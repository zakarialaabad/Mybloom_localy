<?php
$path = __DIR__ . '/../database/seeders/products.json';
$data = json_decode(file_get_contents($path), true);
$types = array_unique(array_map(function($p){ return $p['type_produit'] ?? ''; }, $data['catalog']['products']));
sort($types);
echo "Unique types in products.json:\n";
foreach($types as $t) echo " - $t\n";
echo "\nTotal unique: " . count($types) . "\n";
