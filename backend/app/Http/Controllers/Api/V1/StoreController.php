<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Jobs\SendContactFormEmail;
use App\Models\Admin;
use App\Models\ContactSubmission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Validation\ValidationException;

class StoreController extends Controller
{
    /**
     * GET /api/v1/store/contact
     * Returns public contact info from the first admin record.
     */
    public function contact(): JsonResponse
    {
        $data = Cache::remember('store.contact', now()->addHours(1), function () {
            $admin = Admin::select('email', 'phone')->first();
            return [
                'email' => $admin?->email ?? null,
                'phone' => $admin?->phone ?? null,
            ];
        });

        return response()->json(['data' => $data]);
    }

    /**
     * POST /api/v1/store/contact-submit
     * Submit a contact form from the public website
     * 
     * Mirrors OrderService pattern:
     * 1. Save submission to DB
     * 2. Dispatch email job with submission ID (NOT raw data)
     * 3. Job queries DB and sends email (same as SendAdminOrderEmail)
     */
    public function submitContact(Request $request): JsonResponse
    {
        try {
            $validated = $request->validate([
                'name'    => 'required|string|max:255|min:2',
                'phone'   => 'required|string|max:20|min:8',
                'subject' => 'required|string|max:255|min:5',
                'message' => 'required|string|max:2000|min:10',
            ]);
        } catch (ValidationException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors'  => $e->errors(),
            ], 422);
        }

        try {
            // ── 1. Save to database (like OrderService creates Order) ──────────────
            $submission = ContactSubmission::create([
                'visitor_name'    => $validated['name'],
                'visitor_phone'   => $validated['phone'],
                'visitor_subject' => $validated['subject'],
                'visitor_message' => $validated['message'],
                'email_sent'      => false,
            ]);

            // ── 2. Dispatch job with ID only (like SendAdminOrderEmail::dispatch($order->order_number)) ──
            SendContactFormEmail::dispatch($submission->id);

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent successfully. We will get back to you soon!',
            ], 200);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send your message. Please try again later.',
            ], 500);
        }
    }
}
