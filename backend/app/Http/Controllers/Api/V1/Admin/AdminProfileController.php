<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Services\ImageService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Http\JsonResponse;

class AdminProfileController extends Controller
{
    private ImageService $imageService;

    public function __construct(ImageService $imageService)
    {
        $this->imageService = $imageService;
    }

    /**
     * GET /api/v1/admin/profile
     */
    public function show(Request $request): JsonResponse
    {
        $admin = auth('admins')->user();
        if (!$admin) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $response = response()->json([
            'data' => [
                'id' => $admin->id,
                'username' => $admin->username,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'profile_image' => $admin->profile_image
                    ? rtrim(config('app.url'), '/') . Storage::url($admin->profile_image)
                    : null,
                'last_login_at' => $admin->last_login_at,
                'created_at' => $admin->created_at,
            ]
        ]);

        // Cache for 5 minutes on client side to prevent redundant requests
        return $response
            ->header('Cache-Control', 'private, max-age=300')
            ->header('ETag', '"admin-profile-' . $admin->id . '-' . $admin->updated_at->timestamp . '"');
    }

    /**
     * POST /api/v1/admin/profile (Using POST instead of PUT because of FormData file uploads in PHP/Laravel)
     */
    public function update(Request $request): JsonResponse
    {
        $admin = auth('admins')->user();
        
        \Log::info('[AdminProfile.update] Request received', [
            'hasFile' => $request->hasFile('profile_image'),
            'username' => $request->input('username'),
            'email' => $request->input('email'),
            'phone' => $request->input('phone'),
        ]);

        try {
            $validated = $request->validate([
                'username' => ['nullable', 'string', 'max:255'],
                'email' => ['required', 'email', 'max:255', 'unique:admins,email,' . $admin->id],
                'phone' => ['nullable', 'string', 'max:20'],
                'profile_image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,gif,webp', 'max:2048'],
            ]);
            
            \Log::info('[AdminProfile.update] Validation passed', ['validated' => $validated]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('[AdminProfile.update] Validation failed', [
                'errors' => $e->errors(),
            ]);
            throw $e;
        }

        if ($request->hasFile('profile_image')) {
            \Log::info('[AdminProfile.update] File found, processing image...');
            // Delete old image if exists
            if ($admin->profile_image) {
                \Log::info('[AdminProfile.update] Deleting old image:', ['old_path' => $admin->profile_image]);
                $this->imageService->delete($admin->profile_image);
            }
            try {
                $result = $this->imageService->process($request->file('profile_image'), 'admin_profiles');
                $admin->profile_image = $result->relativePath;
                \Log::info('[AdminProfile.update] Image processed:', ['path' => $result->relativePath]);
            } catch (\Exception $e) {
                \Log::error('[AdminProfile.update] Image processing failed:', ['error' => $e->getMessage()]);
                throw new \Exception('Failed to process profile image: ' . $e->getMessage());
            }
        } else if ($request->input('delete_profile_image') === 'true') {
            // User explicitly requested image deletion
            \Log::info('[AdminProfile.update] Deletion requested, removing image...');
            if ($admin->profile_image) {
                \Log::info('[AdminProfile.update] Deleting profile image:', ['path' => $admin->profile_image]);
                $this->imageService->delete($admin->profile_image);
            }
            $admin->profile_image = null;
        }

        if ($request->has('username')) $admin->username = $validated['username'];
        $admin->email = $validated['email'];
        if ($request->has('phone')) $admin->phone = $validated['phone'];
        
        $admin->save();
        \Log::info('[AdminProfile.update] Admin saved:', ['id' => $admin->id, 'profile_image' => $admin->profile_image]);

        return response()->json([
            'message' => 'Profile updated successfully',
            'data' => [
                'id' => $admin->id,
                'username' => $admin->username,
                'email' => $admin->email,
                'phone' => $admin->phone,
                'profile_image' => $admin->profile_image
                    ? rtrim(config('app.url'), '/') . Storage::url($admin->profile_image)
                    : null,
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
