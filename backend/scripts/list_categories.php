<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
use Illuminate\Support\Facades\DB;

try {
    $rows = DB::select('select id, name, slug from categories');
    foreach ($rows as $r) {
        echo "{$r->id}: {$r->slug} ({$r->name})\n";
    }
} catch (\Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}
