<?php

use App\Http\Controllers\Api\V1\BrandController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\ShippingMethodController;
use App\Http\Controllers\Api\V1\Admin\AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Api\V1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\ReviewController as AdminReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| All routes are prefixed with /api (set in bootstrap/app.php).
| Versioned under /v1 — future breaking changes ship as /v2.
|
*/

Route::prefix('api')->group(function () {

    // ── Health check ────────────────────────────────────────────────────────
    Route::get('/health', fn () => response()->json(['status' => 'ok']));

    // ── v1 ──────────────────────────────────────────────────────────────────
    Route::prefix('v1')->name('v1.')->group(function () {

        // ── Public routes — throttle 120 req/min ────────────────────────────
        Route::middleware('throttle:120,1')->group(function () {

            // Catalogue
            Route::get('/products/aggregates',          [ProductController::class, 'aggregates']);
            Route::get('/products',                    [ProductController::class, 'index']);
            Route::get('/products/{slug}',             [ProductController::class, 'show']);
            Route::get('/brands',                      [BrandController::class, 'index']);
            Route::get('/categories',                  [CategoryController::class, 'index']);
            Route::get('/shipping-methods',            [ShippingMethodController::class, 'index']);

            // Coupon validation
            Route::post('/coupons/validate',           [CouponController::class, 'validate']);

            // Orders — create + track (no auth)
            Route::post('/orders',                                [OrderController::class, 'store']);
            Route::get('/orders/{orderNumber}/track',             [OrderController::class, 'track']);

            // Reviews — post (linked by order_number, no auth)
            Route::post('/reviews',                    [ReviewController::class, 'store']);
        });

        // ── Admin — auth endpoint (no sanctum guard, only throttle) ─────────
        Route::prefix('admin/auth')->name('admin.auth.')->middleware('throttle:10,1')->group(function () {
            Route::post('/login',  [AdminAuthController::class, 'login'])->name('login');
            Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
            Route::get('/me',      [AdminAuthController::class, 'me'])->name('me');
        });

        // ── Admin — protected routes ─────────────────────────────────────────
        Route::prefix('admin')->name('admin.')
            ->middleware(['auth:sanctum', 'ensure.admin', 'throttle:300,1'])
            ->group(function () {

                // Products
                Route::apiResource('products', AdminProductController::class);
                Route::post('products/{product}/images',        [AdminProductController::class, 'storeImage']);
                Route::delete('products/{product}/images/{id}', [AdminProductController::class, 'destroyImage']);

                // Brands
                Route::apiResource('brands',     AdminBrandController::class);

                // Categories
                Route::apiResource('categories', AdminCategoryController::class);

                // Coupons
                Route::apiResource('coupons',    AdminCouponController::class);

                // Orders
                Route::get('orders',                       [AdminOrderController::class, 'index']);
                Route::get('orders/{order}',               [AdminOrderController::class, 'show']);
                Route::patch('orders/{order}/status',      [AdminOrderController::class, 'updateStatus']);
                Route::post('orders/{order}/status-history', [AdminOrderController::class, 'addStatusHistory']);

                // Reviews
                Route::get('reviews',                      [AdminReviewController::class, 'index']);
                Route::patch('reviews/{review}/approve',   [AdminReviewController::class, 'approve']);
                Route::patch('reviews/{review}/reject',    [AdminReviewController::class, 'reject']);
                Route::delete('reviews/{review}',          [AdminReviewController::class, 'destroy']);
            });
    });
});
