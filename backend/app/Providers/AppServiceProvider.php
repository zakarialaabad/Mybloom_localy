<?php

namespace App\Providers;

use App\Services\ImageService;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        // Register ImageService as singleton
        $this->app->singleton(ImageService::class, function ($app) {
            return new ImageService();
        });
    }

    public function boot(): void
    {
        // Register the "api" rate limiter required by $middleware->throttleApi()
        RateLimiter::for('api', function (Request $request) {
            return Limit::perMinute(120)->by($request->ip());
        });

        // Order placement — relaxed in local dev, strict in production
        RateLimiter::for('place-order', function (Request $request) {
            $limit = app()->environment('local') ? 60 : 30;
            return Limit::perMinute($limit)->by($request->ip());
        });
    }
}
