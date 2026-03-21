<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\BannerService;
use Illuminate\Http\JsonResponse;

class BannerController extends Controller
{
    public function __construct(private BannerService $service) {}

    /**
     * GET /api/v1/banners/homepage
     * Returns up to 4 active homepage slot banners ordered by position.
     */
    public function homepage(): JsonResponse
    {
        $banners = $this->service->getHomepageBanners();

        return response()->json([
            'data' => $banners->map(fn (object $b) => [
                'id'       => $b->id,
                'title'    => $b->title,
                'image_path' => $b->image_url,
                'link'     => $b->link,
                'position' => $b->position,
            ]),
        ]);
    }

    /**
     * GET /api/v1/banners/collection
     * GET /api/v1/banners/collection/{id}
     * Returns the active hero banner for the given collection (category) id,
     * or the global hero banner if no id is provided.
     */
    public function collectionHero(?int $id = null): JsonResponse
    {
        $banner = $this->service->getCollectionHero($id);

        if (! $banner) {
            return response()->json(['data' => null]);
        }

        return response()->json([
            'data' => [
                'id'         => $banner->id,
                'title'      => $banner->title,
                'image_path' => $banner->image_url,
                'link'       => $banner->link,
            ],
        ]);
    }
}
