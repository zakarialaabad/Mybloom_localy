<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\VideoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;

class VideoController extends Controller
{
    public function __construct(private VideoService $service) {}

    /**
     * GET /api/v1/videos/hero
     *
     * Returns active hero background videos grouped by type.
     * Cached 30 minutes — busted when admin changes any video.
     *
     * Response:
     *   {
     *     "data": {
     *       "desktop": ["url1", "url2", ...],
     *       "mobile":  ["url1", "url2", ...]
     *     }
     *   }
     */
    public function hero(): JsonResponse
    {
        $result = Cache::remember('hero_videos', now()->addMinutes(30), function () {
            // resolveStreamUrl() points to /api/v1/videos/stream/{id}, which
            // handles HTTP Range requests in all environments (including dev).
            // Legacy (Next.js) videos still return their /public path directly.
            $desktop = $this->service->getActive('desktop')
                ->map(fn ($v) => $this->service->resolveStreamUrl($v))
                ->values();

            $mobile = $this->service->getActive('mobile')
                ->map(fn ($v) => $this->service->resolveStreamUrl($v))
                ->values();

            return compact('desktop', 'mobile');
        });

        return response()->json(['data' => $result]);
    }
}
