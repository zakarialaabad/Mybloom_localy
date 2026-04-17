<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\HeroVideo;
use App\Services\VideoService;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * GET /api/v1/videos/stream/{video}
 *
 * Streams a backend-stored hero video with full HTTP Range (partial content)
 * support. This ensures:
 *
 * 1. Seeking works in the browser before the full file downloads.
 * 2. Playback starts immediately on the compressed version if available,
 *    without downloading the original large file.
 * 3. Consistent behaviour in all environments including `php artisan serve`
 *    which may not handle Range on static /storage assets reliably.
 *
 * Legacy videos (is_legacy=true) are served directly by Next.js and do NOT
 * go through this endpoint — they are excluded with a 404.
 */
class VideoStreamController extends Controller
{
    /** Chunk size for streaming reads (64 KB). */
    private const CHUNK_BYTES = 65536;

    public function __construct(private VideoService $service) {}

    public function __invoke(HeroVideo $video): StreamedResponse
    {
        // Legacy videos live in Next.js /public — no backend streaming.
        if ($video->is_legacy) {
            abort(404, 'Legacy video is served by the frontend.');
        }

        // Prefer the compressed version; fall back to original.
        $relPath  = $video->compressed_path ?? $video->path;
        $fullPath = Storage::disk('public')->path($relPath);

        if (! file_exists($fullPath)) {
            abort(404, 'Video file not found on disk.');
        }

        $mimeType = $this->detectMime($fullPath);
        $fileSize = filesize($fullPath);
        $rangeHeader = request()->header('Range');

        // ── Partial-content (Range) request ───────────────────────────────────
        if ($rangeHeader && preg_match('/bytes=(\d+)-(\d*)/', $rangeHeader, $m)) {
            $start  = (int) $m[1];
            $end    = (isset($m[2]) && $m[2] !== '') ? (int) $m[2] : $fileSize - 1;
            $end    = min($end, $fileSize - 1);
            $length = max(0, $end - $start + 1);

            return response()->stream(
                function () use ($fullPath, $start, $length) {
                    $fp        = fopen($fullPath, 'rb');
                    fseek($fp, $start);
                    $remaining = $length;
                    while ($remaining > 0 && ! feof($fp)) {
                        $chunk      = fread($fp, min(self::CHUNK_BYTES, $remaining));
                        $remaining -= strlen($chunk);
                        echo $chunk;
                        flush();
                    }
                    fclose($fp);
                },
                206,
                [
                    'Content-Type'   => $mimeType,
                    'Content-Range'  => "bytes {$start}-{$end}/{$fileSize}",
                    'Content-Length' => $length,
                    'Accept-Ranges'  => 'bytes',
                    'Cache-Control'  => 'public, max-age=86400',
                ]
            );
        }

        // ── Full-file response ────────────────────────────────────────────────
        return response()->stream(
            function () use ($fullPath) {
                $fp = fopen($fullPath, 'rb');
                while (! feof($fp)) {
                    echo fread($fp, self::CHUNK_BYTES);
                    flush();
                }
                fclose($fp);
            },
            200,
            [
                'Content-Type'   => $mimeType,
                'Content-Length' => $fileSize,
                'Accept-Ranges'  => 'bytes',
                'Cache-Control'  => 'public, max-age=86400',
            ]
        );
    }

    private function detectMime(string $path): string
    {
        $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
        return match ($ext) {
            'webm'  => 'video/webm',
            'ogg'   => 'video/ogg',
            default => 'video/mp4',
        };
    }
}
