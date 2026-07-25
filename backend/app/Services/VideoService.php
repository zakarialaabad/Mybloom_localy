<?php

namespace App\Services;

use App\Jobs\CompressVideoJob;
use App\Models\HeroVideo;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VideoService
{
    /** Allowed MIME types for hero background videos */
    private const ALLOWED_MIMES = ['video/mp4', 'video/webm', 'video/ogg'];

    /** Max upload size in bytes (200 MB) */
    private const MAX_SIZE_BYTES = 200 * 1024 * 1024;

    // ── Queries ────────────────────────────────────────────────────────────────

    /**
     * Return active videos for a given type, ordered for display.
     */
    public function getActive(string $type): \Illuminate\Database\Eloquent\Collection
    {
        return HeroVideo::where('type', $type)
            ->where('is_active', true)
            ->orderBy('display_order')
            ->get();
    }

    /**
     * Resolve the public-facing URL for a video.
     *
     * - Legacy videos (is_legacy=true): path is already a rooted frontend path
     *   e.g. "/Home background/Desktop1.mp4" — served directly by Next.js.
     *   Return as-is; the browser resolves it relative to its own origin.
     *
     * - New videos (is_legacy=false): path is a Laravel storage-relative path
     *   e.g. "videos/hero_desktop_abc.mp4" — served via /storage on the backend.
     *   Return the full backend storage URL.
     */
    public function resolveUrl(HeroVideo $video): string
    {
        if ($video->is_legacy) {
            return $video->path;
        }

        // Serve the compressed version when available — smaller file, faster start.
        $path = $video->compressed_path ?? $video->path;

        return Storage::disk('public')->url($path);
    }

    /**
     * Return the URL that should be stored in the public API cache.
     *
     * For non-legacy videos this points to the dedicated streaming endpoint
     * (/api/v1/videos/stream/{id}) which guarantees HTTP Range support in
     * every environment, enabling instant seek and fast first-frame display.
     *
     * For legacy (Next.js /public) videos the frontend path is returned as-is.
     */
    public function resolveStreamUrl(HeroVideo $video): string
    {
        if ($video->is_legacy) {
            return $video->path;
        }

        return rtrim(config('app.url'), '/') . '/api/v1/videos/stream/' . $video->id;
    }

    // ── Mutations ──────────────────────────────────────────────────────────────

    /**
     * Validate and store an uploaded video file.
     *
     * @throws \InvalidArgumentException on invalid type or size
     */
    public function upload(UploadedFile $file, string $type, ?int $order = null): HeroVideo
    {
        $mime = $file->getMimeType();
        if (! in_array($mime, self::ALLOWED_MIMES, true)) {
            throw new \InvalidArgumentException(
                'Format vidéo invalide. Formats acceptés : MP4, WebM, OGG.'
            );
        }

        if ($file->getSize() > self::MAX_SIZE_BYTES) {
            throw new \InvalidArgumentException(
                'Fichier trop volumineux. Taille maximale : 200 Mo.'
            );
        }

        $ext      = strtolower($file->getClientOriginalExtension() ?: 'mp4');
        $filename = 'hero_' . $type . '_' . Str::random(12) . '.' . $ext;
        $path     = $file->storeAs('videos', $filename, 'public');

        $video = DB::transaction(function () use ($path, $type, $order) {
            $targetOrder = $order ?? ((int) HeroVideo::where('type', $type)->max('display_order') + 1);

            $video = HeroVideo::create([
                'path'          => $path,
                'type'          => $type,
                'display_order' => 255,
                'is_active'     => true,
                'is_legacy'     => false,
            ]);

            return $this->moveToOrder($video, $type, $targetOrder);
        });

        // Dispatch FFmpeg compression in the background.
        // With QUEUE_CONNECTION=sync this runs immediately before returning.
        // With a real driver (database, redis) it runs asynchronously,
        // keeping upload response times fast.
        CompressVideoJob::dispatch($video);

        $this->bustCache();

        return $video->refresh();
    }

    /**
     * Update display_order or is_active on an existing video.
     */
    public function update(HeroVideo $video, array $data): HeroVideo
    {
        $originalType = $video->type;

        $updated = DB::transaction(function () use ($video, $data, $originalType) {
            if (array_key_exists('is_active', $data)) {
                $video->is_active = (bool) $data['is_active'];
            }

            $targetType = $data['type'] ?? $video->type;
            $targetOrder = array_key_exists('display_order', $data)
                ? (int) $data['display_order']
                : null;

            if ($targetType !== $video->type || $targetOrder !== null) {
                $video = $this->moveToOrder($video, $targetType, $targetOrder);

                if ($originalType !== $targetType) {
                    $this->normalizeOrders($originalType);
                }
            } else {
                $video->save();
                $this->normalizeOrders($video->type);
            }

            return $video->refresh();
        });

        $this->bustCache();

        return $updated;
    }

    /**
     * Reorder every video for one device type using the supplied ordered IDs.
     *
     * @param int[] $orderedIds
     */
    public function reorder(string $type, array $orderedIds): \Illuminate\Database\Eloquent\Collection
    {
        $videos = DB::transaction(function () use ($type, $orderedIds) {
            $videos = HeroVideo::where('type', $type)
                ->orderBy('display_order')
                ->orderBy('id')
                ->get()
                ->keyBy('id');

            $uniqueIds = collect($orderedIds)
                ->map(fn ($id) => (int) $id)
                ->unique()
                ->values();

            if ($uniqueIds->count() !== $videos->count() || $uniqueIds->diff($videos->keys())->isNotEmpty()) {
                throw new \InvalidArgumentException('La liste de réorganisation ne correspond pas aux vidéos de cet appareil.');
            }

            foreach ($uniqueIds as $index => $id) {
                $videos[$id]->update(['display_order' => $index + 1]);
            }

            $this->normalizeOrders($type);

            return HeroVideo::where('type', $type)
                ->orderBy('display_order')
                ->orderBy('id')
                ->get();
        });

        $this->bustCache();

        return $videos;
    }

    /**
     * Delete a video record and its backing file (non-legacy only).
     */
    public function destroy(HeroVideo $video): void
    {
        $type = $video->type;

        if (! $video->is_legacy) {
            // Delete original, compressed version, and thumbnail if they exist.
            foreach ([$video->path, $video->compressed_path, $video->thumbnail_path] as $rel) {
                if ($rel) {
                    Storage::disk('public')->delete($rel);
                }
            }
        }

        DB::transaction(function () use ($video, $type) {
            $video->delete();
            $this->normalizeOrders($type);
        });

        $this->bustCache();
    }

    /**
     * Keep display_order sequential and gap-free for one device type.
     */
    public function normalizeOrders(string $type): void
    {
        HeroVideo::where('type', $type)
            ->orderBy('display_order')
            ->orderBy('id')
            ->get()
            ->values()
            ->each(function (HeroVideo $video, int $index) {
                $nextOrder = $index + 1;
                if ($video->display_order !== $nextOrder) {
                    $video->update(['display_order' => $nextOrder]);
                }
            });
    }

    private function moveToOrder(HeroVideo $video, string $type, ?int $targetOrder): HeroVideo
    {
        $siblings = HeroVideo::where('type', $type)
            ->where('id', '!=', $video->id)
            ->orderBy('display_order')
            ->orderBy('id')
            ->get()
            ->values();

        $targetOrder = max(1, min($targetOrder ?? ($siblings->count() + 1), $siblings->count() + 1));

        $video->type = $type;
        $video->display_order = $targetOrder;
        $video->save();

        $ordered = $siblings->all();
        array_splice($ordered, $targetOrder - 1, 0, [$video->refresh()]);

        foreach ($ordered as $index => $orderedVideo) {
            $nextOrder = $index + 1;
            if ($orderedVideo->display_order !== $nextOrder || $orderedVideo->type !== $type) {
                $orderedVideo->update([
                    'type'          => $type,
                    'display_order' => $nextOrder,
                ]);
            }
        }

        return $video->refresh();
    }

    // ── FFmpeg compression ─────────────────────────────────────────────────────

    /**
     * Compress a stored video using FFmpeg:
     *   - H.264 codec (libx264), CRF 28 (good quality, ~60-80% size reduction)
     *   - Scale width to max 1920px, height auto (divisible by 2)
     *   - -movflags +faststart: moves moov atom to file start so playback
     *     begins immediately without downloading the full file
     *   - -an: strip audio track (background videos are muted in the UI)
     *
     * Returns the storage-relative path of the compressed file, or null on failure.
     * Idempotent: if a compressed file already exists the method returns early.
     */
    public function compress(HeroVideo $video): ?string
    {
        if ($video->is_legacy) {
            return null; // Legacy files live on the frontend filesystem — do not touch.
        }

        $ffmpeg = $this->findFfmpeg();
        if (! $ffmpeg) {
            Log::channel('single')->warning('VideoService::compress — FFmpeg binary not found. Skipping.');
            return null;
        }

        $sourcePath = Storage::disk('public')->path($video->path);
        if (! file_exists($sourcePath)) {
            return null;
        }

        // Skip if already compressed and file exists.
        if ($video->compressed_path) {
            $existingDest = Storage::disk('public')->path($video->compressed_path);
            if (file_exists($existingDest)) {
                return $video->compressed_path;
            }
        }

        $baseName       = pathinfo($video->path, PATHINFO_FILENAME);
        $compressedRel  = 'videos/c_' . $baseName . '.mp4';
        $destPath       = Storage::disk('public')->path($compressedRel);

        $code = $this->runFfmpeg($ffmpeg, [
            '-i',        $sourcePath,
            '-vcodec',   'libx264',
            '-crf',      '28',
            '-preset',   'fast',
            '-vf',       "scale='min(iw,1920)':-2",
            '-movflags', '+faststart',
            '-an',
            '-y',        $destPath,
        ]);

        if ($code !== 0 || ! file_exists($destPath)) {
            Log::channel('single')->error("VideoService::compress — FFmpeg exited with code {$code} for video #{$video->id}.");
            return null;
        }

        $originalSize   = filesize($sourcePath);
        $compressedSize = filesize($destPath);
        $reduction      = $originalSize > 0 ? round((1 - $compressedSize / $originalSize) * 100) : 0;
        Log::channel('single')->info("VideoService::compress — video #{$video->id} reduced {$reduction}% ({$originalSize} → {$compressedSize} bytes).");

        $video->update([
            'compressed_path' => $compressedRel,
            'compressed_at'   => now(),
        ]);

        $this->bustCache();

        return $compressedRel;
    }

    /**
     * Extract a JPEG thumbnail at the 1-second mark from the compressed video
     * (or original if not yet compressed). Stored in storage/public/thumbnails/.
     * Used as the <video poster> so users see a frame instantly.
     *
     * Returns the storage-relative thumbnail path, or null on failure.
     */
    public function generateThumbnail(HeroVideo $video): ?string
    {
        if ($video->is_legacy) {
            return null;
        }

        $ffmpeg = $this->findFfmpeg();
        if (! $ffmpeg) {
            return null;
        }

        $sourcePath = Storage::disk('public')->path(
            $video->compressed_path ?? $video->path
        );
        if (! file_exists($sourcePath)) {
            return null;
        }

        $baseName  = pathinfo($video->path, PATHINFO_FILENAME);
        $thumbRel  = 'thumbnails/' . $baseName . '.jpg';
        $thumbDest = Storage::disk('public')->path($thumbRel);

        $thumbDir = dirname($thumbDest);
        if (! is_dir($thumbDir)) {
            mkdir($thumbDir, 0755, true);
        }

        $code = $this->runFfmpeg($ffmpeg, [
            '-i',       $sourcePath,
            '-ss',      '00:00:01',
            '-vframes', '1',
            '-q:v',     '3',
            '-y',       $thumbDest,
        ]);

        if ($code !== 0 || ! file_exists($thumbDest)) {
            return null;
        }

        $video->update(['thumbnail_path' => $thumbRel]);
        return $thumbRel;
    }

    /**
     * Run FFmpeg safely using proc_open with an argument array.
     * Using an array (not a shell string) prevents any shell injection.
     * stdout and stderr are fully drained to prevent pipe-buffer deadlocks.
     *
     * @param  string   $ffmpeg  Absolute or PATH-relative binary name.
     * @param  string[] $args    Arguments (no shell quoting needed).
     * @return int               Process exit code. 0 = success.
     */
    private function runFfmpeg(string $ffmpeg, array $args): int
    {
        $cmd  = array_merge([$ffmpeg], $args);
        $spec = [
            0 => ['pipe', 'r'],
            1 => ['pipe', 'w'],
            2 => ['pipe', 'w'],
        ];

        $proc = proc_open($cmd, $spec, $pipes);
        if (! is_resource($proc)) {
            return 1;
        }

        fclose($pipes[0]);
        stream_get_contents($pipes[1]); // drain stdout
        stream_get_contents($pipes[2]); // drain stderr (prevents deadlock on large output)
        fclose($pipes[1]);
        fclose($pipes[2]);

        return proc_close($proc);
    }

    /**
     * Locate a working FFmpeg binary. Checks PATH first, then common install paths.
     * Returns the binary name/path, or null if FFmpeg is not installed.
     */
    private function findFfmpeg(): ?string
    {
        // Check env override first (useful in Docker / CI environments)
        $envPath = env('FFMPEG_BINARY');
        if ($envPath && file_exists($envPath)) {
            return $envPath;
        }

        $candidates = PHP_OS_FAMILY === 'Windows'
            ? ['ffmpeg', 'C:\\ffmpeg\\bin\\ffmpeg.exe', 'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe']
            : ['ffmpeg', '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg', '/opt/homebrew/bin/ffmpeg'];

        foreach ($candidates as $bin) {
            exec($bin . ' -version 2>&1', $out, $code);
            $out = [];
            if ($code === 0) {
                return $bin;
            }
        }

        return null;
    }

    // ── Cache ──────────────────────────────────────────────────────────────────

    public function bustCache(): void
    {
        Cache::forget('hero_videos');
    }
}
