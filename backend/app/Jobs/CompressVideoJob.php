<?php

namespace App\Jobs;

use App\Models\HeroVideo;
use App\Services\VideoService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

/**
 * Compress an uploaded hero video with FFmpeg in the background.
 *
 * With QUEUE_CONNECTION=sync (default), this runs immediately after upload.
 * With a real queue driver it runs asynchronously, keeping the upload response fast.
 *
 * The job is idempotent — if the compressed file already exists it exits early.
 */
class CompressVideoJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /** Allow up to 10 minutes for FFmpeg processing of large files. */
    public int $timeout = 600;

    /** Retry once on transient failure (e.g. disk full momentarily). */
    public int $tries = 2;

    public function __construct(public readonly HeroVideo $video) {}

    public function handle(VideoService $service): void
    {
        $id = $this->video->id;

        Log::channel('single')->info("CompressVideoJob: starting compression for video #{$id} (type={$this->video->type})");

        $compressedPath = $service->compress($this->video);

        if ($compressedPath) {
            // Thumbnail from the compressed file for fast poster display.
            $service->generateThumbnail($this->video->refresh());
            Log::channel('single')->info("CompressVideoJob: completed for video #{$id} → {$compressedPath}");
        } else {
            Log::channel('single')->warning(
                "CompressVideoJob: FFmpeg unavailable or processing failed for video #{$id}. " .
                "Original file will be served instead."
            );
        }
    }
}
