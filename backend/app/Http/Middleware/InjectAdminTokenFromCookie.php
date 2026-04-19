<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class InjectAdminTokenFromCookie
{
    /**
     * If the request carries an admin_token cookie but no Authorization header,
     * promote the cookie value to a Bearer token so Sanctum can authenticate.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->hasHeader('Authorization') && $request->cookie('admin_token')) {
            $request->headers->set('Authorization', 'Bearer ' . $request->cookie('admin_token'));
        }

        return $next($request);
    }
}
