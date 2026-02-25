<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    /**
     * Verify the authenticated user belongs to the `admins` guard.
     * Sanctum populates `auth('admins')` via the guard set in config/auth.php.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $admin = auth('admins')->user();

        if (! $admin) {
            return response()->json(['message' => 'Forbidden.'], 403);
        }

        return $next($request);
    }
}
