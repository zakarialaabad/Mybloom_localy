<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
use Illuminate\Support\Facades\DB;
$types = DB::table('product_types')->orderBy('id')->pluck('name', 'id')->toArray();
foreach ($types as $id => $name) {
    echo "[$id] $name\n";
}
echo "Total types: " . count($types) . "\n";
