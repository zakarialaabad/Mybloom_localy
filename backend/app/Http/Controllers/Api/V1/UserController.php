<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UserController extends Controller
{
    /**
     * List all users — admin only.
     */
    public function index(): AnonymousResourceCollection
    {
        $this->authorizeAdmin();

        $users = User::latest()->paginate(20);

        return UserResource::collection($users);
    }

    /**
     * Show a specific user.
     */
    public function show(User $user): JsonResponse
    {
        $this->authorizeAdmin();

        return response()->json(['data' => new UserResource($user)]);
    }

    /**
     * Update the authenticated user's own profile.
     */
    public function update(UpdateProfileRequest $request, User $user): JsonResponse
    {
        // Users can only update themselves; admins can update anyone
        if (auth()->id() !== $user->id) {
            $this->authorizeAdmin();
        }

        $user->update($request->validated());

        return response()->json(['data' => new UserResource($user)]);
    }

    /**
     * Soft-delete a user — admin only.
     */
    public function destroy(User $user): JsonResponse
    {
        $this->authorizeAdmin();

        $user->delete();

        return response()->json(['message' => 'User deleted successfully.']);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private function authorizeAdmin(): void
    {
        if (auth()->user()?->role !== 'admin') {
            abort(403, 'Forbidden: admin access required.');
        }
    }
}
