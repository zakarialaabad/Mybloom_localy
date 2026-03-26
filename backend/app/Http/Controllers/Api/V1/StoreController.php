<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Admin;
use Illuminate\Http\JsonResponse;

class StoreController extends Controller
{
    /**
     * GET /api/v1/store/contact
     * Returns public contact info from the first admin record.
     */
    public function contact(): JsonResponse
    {
        $admin = Admin::select('email', 'phone')->first();

        return response()->json([
            'data' => [
                'email' => $admin?->email ?? null,
                'phone' => $admin?->phone ?? null,
            ]
        ]);
    }
}
