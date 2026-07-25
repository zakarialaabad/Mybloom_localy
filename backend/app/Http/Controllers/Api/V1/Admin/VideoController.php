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
        $data = request()->validate([
            'type' => 'nullable|in:desktop,mobile',
        ]);

        if (! empty($data['type'])) {
            $this->service->normalizeOrders($data['type']);
        } else {
            $this->service->normalizeOrders('desktop');
            $this->service->normalizeOrders('mobile');
        }

        $videos = HeroVideo::query()
            ->when($data['type'] ?? null, fn ($query, $type) => $query->where('type', $type))
            ->orderBy('type')
            ->orderBy('display_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'success' => true,
            'message' => 'Hero videos loaded.',
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
                $data['display_order'] ?? null,
            );
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Hero video uploaded.',
            'data' => $this->format($video),
        ], 201);
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

        return response()->json([
            'success' => true,
            'message' => 'Hero video updated.',
            'data' => $this->format($updated),
        ]);
    }

    /**
     * PATCH /api/v1/admin/videos/reorder
     * Replace display_order for one device type in a single atomic operation.
     */
    public function reorder(Request $request): JsonResponse
    {
        $data = $request->validate([
            'type' => 'required|in:desktop,mobile',
            'ordered_ids' => 'required|array|min:1',
            'ordered_ids.*' => 'required|integer|distinct|exists:hero_videos,id',
        ]);

        try {
            $videos = $this->service->reorder($data['type'], $data['ordered_ids']);
        } catch (\InvalidArgumentException $e) {
            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }

        return response()->json([
            'success' => true,
            'message' => 'Hero video order updated.',
            'data' => $videos->map(fn (HeroVideo $v) => $this->format($v)),
        ]);
    }

    /**
     * DELETE /api/v1/admin/videos/{video}
     * Remove a video record (and its backing file if not legacy).
     */
    public function destroy(HeroVideo $video): JsonResponse
    {
        $this->service->destroy($video);

        return response()->json([
            'success' => true,
            'message' => 'Hero video deleted.',
        ]);
    }

    // ── Private ────────────────────────────────────────────────────────────────

    private function format(HeroVideo $v): array
    {
        return [
            'id'            => $v->id,
            'url'           => $this->service->resolveUrl($v),
            'stream_url'    => $this->service->resolveStreamUrl($v),
            'thumbnail_url' => $v->thumbnail_path ? \Illuminate\Support\Facades\Storage::disk('public')->url($v->thumbnail_path) : null,
            'path'          => $v->path,
            'type'          => $v->type,
            'display_order' => $v->display_order,
            'is_active'     => $v->is_active,
            'is_legacy'     => $v->is_legacy,
            'created_at'    => $v->created_at?->toISOString(),
            'updated_at'    => $v->updated_at?->toISOString(),
        ];
    }
}
