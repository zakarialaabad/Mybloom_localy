<?php

use App\Http\Controllers\Api\V1\BrandController;
use App\Http\Controllers\Api\V1\CategoryController;
use App\Http\Controllers\Api\V1\IngredientController;
use App\Http\Controllers\Api\V1\CouponController;
use App\Http\Controllers\Api\V1\OrderController;
use App\Http\Controllers\Api\V1\ProductController;
use App\Http\Controllers\Api\V1\ReviewController;
use App\Http\Controllers\Api\V1\ShippingMethodController;
use App\Http\Controllers\Api\V1\StoreController;
use App\Http\Controllers\Api\V1\Admin\AdminAuthController;
use App\Http\Controllers\Api\V1\Admin\BrandController as AdminBrandController;
use App\Http\Controllers\Api\V1\Admin\CategoryController as AdminCategoryController;
use App\Http\Controllers\Api\V1\Admin\CouponController as AdminCouponController;
use App\Http\Controllers\Api\V1\Admin\OrderController as AdminOrderController;
use App\Http\Controllers\Api\V1\Admin\ProductController as AdminProductController;
use App\Http\Controllers\Api\V1\Admin\ProductTypeController as AdminProductTypeController;
use App\Http\Controllers\Api\V1\Admin\ReviewController as AdminReviewController;
use App\Http\Controllers\Api\V1\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Api\V1\Admin\AdminProfileController;
use App\Http\Controllers\Api\V1\BannerController;
use App\Http\Controllers\Api\V1\Admin\BannerController as AdminBannerController;
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
            Route::get('/ingredients',                 [IngredientController::class, 'index']);
            Route::get('/product-types',               [AdminProductTypeController::class, 'index']);
            Route::get('/shipping-methods',            [ShippingMethodController::class, 'index']);

            // Coupon validation
            Route::post('/coupons/validate',           [CouponController::class, 'check']);

            // Orders — create + track (no auth)
            Route::post('/orders',                                [OrderController::class, 'store']);
            Route::get('/orders/{orderNumber}/track',             [OrderController::class, 'track']);
            Route::get('/invoices/{orderNumber}/download',        [OrderController::class, 'downloadInvoice']);

            // Reviews — GET (approved, optional product_id scope) | POST (submit, no auth)
            Route::get('/reviews',                     [ReviewController::class, 'index']);
            Route::post('/reviews',                    [ReviewController::class, 'store']);

            // Banners — public read-only
            Route::get('/banners/homepage',            [BannerController::class, 'homepage']);
            Route::get('/banners/collection/{id?}',    [BannerController::class, 'collectionHero']);

            // Store — public contact info
            Route::get('/store/contact',               [StoreController::class, 'contact']);
            Route::post('/store/contact-submit',       [StoreController::class, 'submitContact']);
        });

        // ── Admin — auth endpoint (no sanctum guard, only throttle) ─────────
        Route::prefix('admin/auth')->name('admin.auth.')->middleware('throttle:10,1')->group(function () {
            Route::post('/login',  [AdminAuthController::class, 'login'])->name('login');
            Route::post('/logout', [AdminAuthController::class, 'logout'])->name('logout');
            Route::get('/me',      [AdminAuthController::class, 'me'])->name('me');
        });

        // ── Admin — protected routes ─────────────────────────────────────────
        Route::prefix('admin')->name('admin.')
            ->middleware(['auth:admins', 'ensure.admin', 'throttle:300,1'])
            ->group(function () {

                // Dashboard analytics
                Route::get('dashboard', [AdminDashboardController::class, 'index']);

                // Profile Settings
                Route::get('profile', [AdminProfileController::class, 'show']);
                Route::post('profile', [AdminProfileController::class, 'update']);
                Route::put('profile/password', [AdminProfileController::class, 'changePassword']);

                // Ingredients
                Route::post('ingredients', [IngredientController::class, 'store']);

                // Products
                Route::apiResource('products', AdminProductController::class);
                Route::post('products/{product}/images',        [AdminProductController::class, 'storeImage']);
                Route::delete('products/{product}/images/{id}', [AdminProductController::class, 'destroyImage']);

                // Product Types
                Route::get('product-types', [AdminProductTypeController::class, 'index']);

                // Brands
                Route::apiResource('brands',     AdminBrandController::class);

                // Categories
                Route::apiResource('categories', AdminCategoryController::class);

                // Coupons
                Route::get('coupons/stats',  [AdminCouponController::class, 'stats']);
                Route::apiResource('coupons', AdminCouponController::class);

                // Orders
                Route::get('orders/stats',                 [AdminOrderController::class, 'stats']);
                Route::get('orders',                       [AdminOrderController::class, 'index']);
                Route::get('orders/{order}',               [AdminOrderController::class, 'show']);
                Route::patch('orders/{order}/status',      [AdminOrderController::class, 'updateStatus']);
                Route::post('orders/{order}/status-history', [AdminOrderController::class, 'addStatusHistory']);

                // Reviews
                Route::get('reviews/stats',                [AdminReviewController::class, 'stats']);
                Route::get('reviews',                      [AdminReviewController::class, 'index']);
                Route::post('reviews',                     [AdminReviewController::class, 'store']);
                Route::patch('reviews/{review}',           [AdminReviewController::class, 'update']);
                Route::patch('reviews/{review}/approve',   [AdminReviewController::class, 'approve']);
                Route::patch('reviews/{review}/reject',    [AdminReviewController::class, 'reject']);
                Route::delete('reviews/{review}',          [AdminReviewController::class, 'destroy']);

                // Banners
                Route::get('banners',                      [AdminBannerController::class, 'index']);
                Route::post('banners',                     [AdminBannerController::class, 'store']);
                Route::put('banners/{banner}',             [AdminBannerController::class, 'update']);
                Route::delete('banners/{banner}',          [AdminBannerController::class, 'destroy']);
            });
    });
});
