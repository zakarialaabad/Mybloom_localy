<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\\Contracts\\Console\\Kernel')->bootstrap();
use Illuminate\Support\Facades\DB;

$rows = DB::select("select b.id, b.name, b.slug, count(p.id) as product_count from brands b left join products p on p.brand_id = b.id group by b.id, b.name, b.slug order by lower(b.name)");
foreach ($rows as $r) {
    echo "[{$r->id}] {$r->name} (slug: {$r->slug}) - products: {$r->product_count}\n";
}
