<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroVideo;
use App\Services\VideoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class VideoController extends Controller
{
    public function __construct(private VideoService $service) {}

    /**
     * GET /api/v1/admin/videos
     * List all hero videos (both active and inactive) with resolved URLs.
     */
    public function index(): JsonResponse
    {
        $videos = HeroVideo::orderBy('type')->orderBy('display_order')->get();

        return response()->json([
            'data' => $videos->map(fn (HeroVideo $v) => $this->format($v)),
        ]);
    }

    /**
     * POST /api/v1/admin/videos
     * Upload a new hero background video.
     * Expects multipart/form-data with fields: video (file), type, display_order (optional).
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type'          => 'required|in:desktop,mobile',
            'display_order' => 'nullable|integer|min:1|max:99',
            'video'         => 'required|file|mimes:mp4,webm,ogg|max:204800', // 200 MB
        ]);

        try {
            $video = $this->service->upload(
                $request->file('video'),
                $data['type'],
                $data['display_order'] ?? 1,
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['data' => $this->format($video)], 201);
    }

    /**
     * PATCH /api/v1/admin/videos/{video}
     * Update display_order, is_active, or type of an existing video.
     */
    public function update(Request $request, HeroVideo $video): JsonResponse
    {
        $data = $request->validate([
            'display_order' => 'nullable|integer|min:1|max:99',
            'is_active'     => 'nullable|boolean',
            'type'          => 'nullable|in:desktop,mobile',
        ]);

        $updated = $this->service->update($video, $data);

        return response()->json(['data' => $this->format($updated)]);
    }

    /**
     * DELETE /api/v1/admin/videos/{video}
     * Remove a video record (and its backing file if not legacy).
     */
    public function destroy(HeroVideo $video): JsonResponse
    {
        $this->service->destroy($video);

        return response()->json(null, 204);
    }

    // ── Private ────────────────────────────────────────────────────────────────

    private function format(HeroVideo $v): array
    {
        return [
            'id'            => $v->id,
            'url'           => $this->service->resolveUrl($v),
            'path'          => $v->path,
            'type'          => $v->type,
            'display_order' => $v->display_order,
            'is_active'     => $v->is_active,
            'is_legacy'     => $v->is_legacy,
            'created_at'    => $v->created_at?->toISOString(),
        ];
    }
}
