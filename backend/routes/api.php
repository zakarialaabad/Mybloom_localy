<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\UserController;
use App\Http\Controllers\Api\V1\ProductController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes  —  all endpoints are prefixed with /api  (set in bootstrap/app.php)
|--------------------------------------------------------------------------
|
| Versioned under /v1 so future breaking changes can ship as /v2 without
| disrupting existing clients.
|
*/

Route::prefix('api')->group(function () {

    // ── Health check ────────────────────────────────────────────────────────
    Route::get('/health', fn () => response()->json(['status' => 'ok']));

    // ── v1 ──────────────────────────────────────────────────────────────────
    Route::prefix('v1')->name('v1.')->group(function () {

        // Auth — public
        Route::prefix('auth')->name('auth.')->group(function () {
            Route::post('/register', [AuthController::class, 'register'])->name('register');
            Route::post('/login',    [AuthController::class, 'login'])->name('login');
        });

        // Auth — protected
        Route::prefix('auth')->name('auth.')->middleware('auth.jwt')->group(function () {
            Route::post('/logout',  [AuthController::class, 'logout'])->name('logout');
            Route::post('/refresh', [AuthController::class, 'refresh'])->name('refresh');
            Route::get('/me',       [AuthController::class, 'me'])->name('me');
        });

        // Users — admin only
        Route::middleware(['auth.jwt', 'throttle:60,1'])
            ->prefix('users')
            ->name('users.')
            ->group(function () {
                Route::get('/',        [UserController::class, 'index'])->name('index');
                Route::get('/{user}',  [UserController::class, 'show'])->name('show');
                Route::put('/{user}',  [UserController::class, 'update'])->name('update');
                Route::delete('/{user}', [UserController::class, 'destroy'])->name('destroy');
            });

        // Products — public read, authenticated write
        Route::prefix('products')->name('products.')->group(function () {
            Route::get('/',             [ProductController::class, 'index'])->name('index');
            Route::get('/{product}',    [ProductController::class, 'show'])->name('show');

            Route::middleware('auth.jwt')->group(function () {
                Route::post('/',            [ProductController::class, 'store'])->name('store');
                Route::put('/{product}',    [ProductController::class, 'update'])->name('update');
                Route::delete('/{product}', [ProductController::class, 'destroy'])->name('destroy');
            });
        });
    });
});
