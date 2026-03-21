<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Models\Banner;
use App\Services\BannerService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BannerController extends Controller
{
    public function __construct(private BannerService $service) {}

    /**
     * GET /api/v1/admin/banners
     */
    public function index(): JsonResponse
    {
        $banners = Banner::orderBy('type')->orderBy('position')->get();

        return response()->json([
            'data' => $banners->map(fn (object $b) => [
                'id'            => $b->id,
                'title'         => $b->title,
                'image_path'    => $b->image_url,
                'type'          => $b->type,
                'collection_id' => $b->collection_id,
                'position'      => $b->position,
                'link'          => $b->link,
                'is_active'     => $b->is_active,
            ]),
        ]);
    }

    /**
     * POST /api/v1/admin/banners
     * Expects multipart/form-data with an "image" file.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'nullable|string|max:255',
            'type'          => 'required|in:homepage_slot,collection_hero',
            'collection_id' => 'nullable|integer|exists:categories,id',
            'position'      => 'nullable|integer|min:1|max:4',
            'link'          => 'nullable|url|max:500',
            'is_active'     => 'nullable|boolean',
            'image'         => 'required|image|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $banner = $this->service->store($data, $request->file('image'));

        return response()->json([
            'data' => [
                'id'            => $banner->id,
                'title'         => $banner->title,
                'image_path'    => $banner->image_url,
                'type'          => $banner->type,
                'collection_id' => $banner->collection_id,
                'position'      => $banner->position,
                'link'          => $banner->link,
                'is_active'     => $banner->is_active,
            ],
        ], 201);
    }

    /**
     * PUT /api/v1/admin/banners/{banner}
     * Supports partial updates. Send "image" file only when replacing the image.
     */
    public function update(Request $request, Banner $banner): JsonResponse
    {
        $data = $request->validate([
            'title'         => 'nullable|string|max:255',
            'type'          => 'nullable|in:homepage_slot,collection_hero',
            'collection_id' => 'nullable|integer|exists:categories,id',
            'position'      => 'nullable|integer|min:1|max:4',
            'link'          => 'nullable|url|max:500',
            'is_active'     => 'nullable|boolean',
            'image'         => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
        ]);

        $banner = $this->service->update($banner, $data, $request->file('image'));

        return response()->json([
            'data' => [
                'id'            => $banner->id,
                'title'         => $banner->title,
                'image_path'    => $banner->image_url,
                'type'          => $banner->type,
                'collection_id' => $banner->collection_id,
                'position'      => $banner->position,
                'link'          => $banner->link,
                'is_active'     => $banner->is_active,
            ],
        ]);
    }

    /**
     * DELETE /api/v1/admin/banners/{banner}
     */
    public function destroy(Banner $banner): JsonResponse
    {
        $this->service->destroy($banner);

        return response()->json(null, 204);
    }
}
