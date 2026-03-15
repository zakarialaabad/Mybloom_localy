<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AdminAuthController extends Controller
{
    /**
     * POST /api/v1/admin/auth/login
     */
    public function login(Request $request): JsonResponse
    {
        $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $admin = Admin::where('email', $request->email)->first();

        if (! $admin || ! Hash::check($request->password, $admin->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        // Revoke previous tokens for this admin
        $admin->tokens()->delete();

        $token = $admin->createToken('admin-session', ['*'], now()->addMinutes(config('sanctum.expiration', 1440)));

        return response()
            ->json([
                'message' => 'Authenticated.',
                'token'   => $token->plainTextToken,
                'admin'   => ['id' => $admin->id, 'email' => $admin->email],
            ])
            ->cookie(
                'admin_token',
                $token->plainTextToken,
                config('sanctum.expiration', 1440),
                '/',
                null,
                config('app.env') === 'production',  // Secure
                false,                                 // NOT HttpOnly — JS reads it to set Authorization header
                false,
                'Lax'
            );
    }

    /**
     * POST /api/v1/admin/auth/logout
     */
    public function logout(Request $request): JsonResponse
    {
        $admin = auth('admins')->user();

        if ($admin) {
            $admin->tokens()->delete();
        }

        return response()
            ->json(['message' => 'Logged out.'])
            ->withoutCookie('admin_token');
    }

    /**
     * GET /api/v1/admin/auth/me
     */
    public function me(Request $request): JsonResponse
    {
        $admin = auth('admins')->user();

        if (! $admin) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json(['admin' => ['id' => $admin->id, 'email' => $admin->email]]);
    }
}
