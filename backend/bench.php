<?php
require __DIR__ . '/vendor/autoload.php';

// Properly boot Laravel (same as artisan/index.php)
$t1 = microtime(true);
$app = require __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(\Illuminate\Contracts\Http\Kernel::class);

// Bootstrap the kernel (loads providers, registers middleware)
$bootstrapRequest = \Illuminate\Http\Request::create('/', 'GET');
$kernel->handle($bootstrapRequest);
$kernel->terminate($bootstrapRequest, new \Illuminate\Http\Response());
$bootTime = round((microtime(true) - $t1) * 1000);
echo "=== LARAVEL INTERNALS BENCHMARK ===\n\n";
echo "1. Laravel full boot: {$bootTime}ms\n";

// 2. File cache read/write (now providers are loaded)
$cache = app('cache')->store('file');

$t2 = microtime(true);
$cache->put('__bench_key', str_repeat('x', 10000), 60);
$cacheWrite = round((microtime(true) - $t2) * 1000, 1);
echo "2. File cache WRITE (10KB): {$cacheWrite}ms\n";

$t3 = microtime(true);
$cache->get('__bench_key');
$cacheRead = round((microtime(true) - $t3) * 1000, 1);
echo "3. File cache READ (10KB): {$cacheRead}ms\n";

$t3b = microtime(true);
$cache->put('__bench_big', str_repeat('x', 130000), 60);
$cacheBigW = round((microtime(true) - $t3b) * 1000, 1);
echo "4. File cache WRITE (130KB): {$cacheBigW}ms\n";

$t3c = microtime(true);
$cache->get('__bench_big');
$cacheBigR = round((microtime(true) - $t3c) * 1000, 1);
echo "5. File cache READ (130KB): {$cacheBigR}ms\n";

// 3. Raw DB queries
$t4 = microtime(true);
\Illuminate\Support\Facades\DB::select('SELECT 1');
$dbPing = round((microtime(true) - $t4) * 1000, 1);
echo "6. DB ping (SELECT 1): {$dbPing}ms\n";

$t5 = microtime(true);
\Illuminate\Support\Facades\DB::select('SELECT COUNT(*) as c FROM products WHERE is_active = 1');
$dbCount = round((microtime(true) - $t5) * 1000, 1);
echo "7. DB count products: {$dbCount}ms\n";

$t5b = microtime(true);
$products = \Illuminate\Support\Facades\DB::select('SELECT * FROM products WHERE is_active = 1');
$dbAll = round((microtime(true) - $t5b) * 1000, 1);
echo "8. DB select all products (raw): {$dbAll}ms (" . count($products) . " rows)\n";

// 4. Eloquent with eager loading (like ProductController)
$t6 = microtime(true);
$eloquent = \App\Models\Product::with(['brand', 'category', 'productType', 'variants', 'images'])
    ->withAvg('reviews as avg_rating', 'rating')
    ->withCount('reviews as review_count')
    ->where('is_active', true)
    ->get();
$eloquentTime = round((microtime(true) - $t6) * 1000, 1);
echo "9. Eloquent + eager load (all products): {$eloquentTime}ms (" . $eloquent->count() . " items)\n";

// 5. Resource serialization
$t7 = microtime(true);
$resource = \App\Http\Resources\ProductResource::collection($eloquent);
$json = $resource->response()->getContent();
$serializeTime = round((microtime(true) - $t7) * 1000, 1);
$jsonSize = round(strlen($json) / 1024, 1);
echo "10. Resource serialization: {$serializeTime}ms ({$jsonSize}KB JSON)\n";

// 6. Gzip compression
$t8 = microtime(true);
$compressed = gzencode($json, 6);
$gzipTime = round((microtime(true) - $t8) * 1000, 1);
$gzipSize = round(strlen($compressed) / 1024, 1);
echo "11. Gzip compression: {$gzipTime}ms ({$jsonSize}KB -> {$gzipSize}KB)\n";

// 7. Simulate full request through kernel (warm)
$t9 = microtime(true);
$request2 = \Illuminate\Http\Request::create('/api/v1/products/aggregates', 'GET');
$request2->headers->set('Accept', 'application/json');
$response2 = $kernel->handle($request2);
$fullReq = round((microtime(true) - $t9) * 1000, 1);
echo "12. Full kernel request (aggregates, warm): {$fullReq}ms\n";

// 8. OPcache status
$opcache = function_exists('opcache_get_status') ? opcache_get_status(false) : false;
echo "\n=== ENVIRONMENT ===\n";
echo "OPcache enabled: " . ($opcache && $opcache['opcache_enabled'] ? 'YES' : 'NO') . "\n";
echo "PHP version: " . PHP_VERSION . "\n";
echo "CACHE_STORE: " . env('CACHE_STORE', 'file') . "\n";

// Cleanup
$cache->forget('__bench_key');
$cache->forget('__bench_big');
