<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Services\VideoService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;

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
            $format = function ($v) {
                $entry = ['src' => $this->service->resolveStreamUrl($v)];
                if ($v->thumbnail_path) {
                    $entry['poster'] = Storage::disk('public')->url($v->thumbnail_path);
                }
                return $entry;
            };

            $desktop = $this->service->getActive('desktop')
                ->map($format)
                ->values();

            $mobile = $this->service->getActive('mobile')
                ->map($format)
                ->values();

            return compact('desktop', 'mobile');
        });

        return response()->json(['data' => $result]);
    }
}
