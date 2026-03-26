<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;

class AdminProfileController extends Controller
{
    /**
     * GET /api/v1/admin/profile
     */
    public function show(Request $request): JsonResponse
    {
        $admin = auth('admins')->user();
        if (!$admin) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        return response()->json([
            'data' => [
                'id' => $admin->id,
                'username' => $admin->username,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'profile_image' => $admin->profile_image ? Storage::url($admin->profile_image) : null,
                'last_login_at' => $admin->last_login_at,
                'created_at' => $admin->created_at,
            ]
        ]);
    }

    /**
     * POST /api/v1/admin/profile (Using POST instead of PUT because of FormData file uploads in PHP/Laravel)
     */
    public function update(Request $request): JsonResponse
    {
        $admin = auth('admins')->user();

        $validated = $request->validate([
            'username' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:admins,email,' . $admin->id],
            'phone' => ['nullable', 'string', 'max:20'],
            'profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
        ]);

        if ($request->hasFile('profile_image')) {
            // Delete old image if exists
            if ($admin->profile_image) {
                Storage::disk('public')->delete($admin->profile_image);
            }
            $path = $request->file('profile_image')->store('admin_profiles', 'public');
            $admin->profile_image = $path;
        }

        if ($request->has('username')) $admin->username = $validated['username'];
        $admin->email = $validated['email'];
        if ($request->has('phone')) $admin->phone = $validated['phone'];
        
        $admin->save();

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $admin->id,
                'username' => $admin->username,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'profile_image' => $admin->profile_image ? Storage::url($admin->profile_image) : null,
            ]
        ]);
    }

    /**
     * PUT /api/v1/admin/profile/password
     */
    public function changePassword(Request $request): JsonResponse
    {
        $admin = auth('admins')->user();

        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => [
                'required',
                'string',
                'min:8',
                'regex:/[A-Z]/',      // 1 uppercase
                'regex:/[a-z]/',      // 1 lowercase
                'regex:/[0-9]/',      // 1 number
                'regex:/[\W_]/',      // 1 special char (any non-word char or underscore)
                'confirmed'           // Requires new_password_confirmation field
            ],
        ], [
            'new_password.regex' => 'The password must contain at least one uppercase letter, one lowercase letter, one number, and one special character.',
        ]);

        if (!Hash::check($validated['current_password'], $admin->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['The provided password does not match your current password.']
            ]);
        }

        $admin->password = Hash::make($validated['new_password']);
        $admin->save();

        return response()->json(['message' => 'Password updated successfully']);
    }
}
