<?php

namespace App\Services;

use App\DTOs\ImageProcessResult;
use Illuminate\Http\UploadedFile;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Image;
use Intervention\Image\Drivers\Gd\Core as GdCore;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\File\UploadedFile as SymfonyUploadedFile;

class ImageService
{
    private ImageManager $imageManager;
    private array $config;
    private string $storagePath;

    public function __construct()
    {
        // Initialize Intervention Image with GD driver
        $this->imageManager = new ImageManager(new Driver());
        $this->config = config('image-optimization');
        $this->storagePath = Storage::disk($this->config['disk'])->path('');
    }

    /**
     * Process an image file - main entry point
     *
     * @param UploadedFile|string $file Path or UploadedFile instance
     * @param string $type Image type (products, reviews, banners, etc)
     * @return ImageProcessResult
     * @throws \Exception
     */
    public function process($file, string $type = 'default'): ImageProcessResult
    {
        try {
            // Get type-specific config
            $typeConfig = $this->getTypeConfig($type);

            // Validate file
            $this->validateImage($file, $typeConfig);

            // Load image with Intervention
            $image = $this->imageManager->read($file);

            // Get original dimensions
            $originalWidth = $image->width();
            $originalHeight = $image->height();
            $originalExtension = $this->getExtension($file);

            // Resize image if needed
            $resized = $this->optimize($image, $typeConfig);

            // Capture dimensions before encoding (Image object has these methods)
            $finalWidth = $resized->width();
            $finalHeight = $resized->height();

            // Determine output extension: use .webp when converting, else keep original
            $outputExtension = ($this->config['convert_to_webp'] && strtolower($originalExtension) !== 'webp')
                ? 'webp'
                : $originalExtension;

            // Generate unique filename with correct output extension
            $filename = $this->generateFilename($type, $outputExtension);
            $relativePath = $typeConfig['path'] . '/' . $filename;
            $fullPath = $this->storagePath . '/' . $relativePath;

            // Ensure directory exists
            @mkdir(dirname($fullPath), 0755, true);

            // Encode and save image
            $this->encodeAndSave($resized, $fullPath, $typeConfig);

            // Get final file size
            $filesize = filesize($fullPath);

            // Determine if converted to WebP
            $converted = strtolower($outputExtension) !== strtolower($originalExtension);
            $finalExtension = $outputExtension;

            // Build URL
            $url = '/storage/' . $relativePath;

            // Log the operation
            if ($this->config['logging']['enabled']) {
                Log::channel($this->config['logging']['channel'])->info('Image processed', [
                    'type' => $type,
                    'filename' => $filename,
                    'original_dimensions' => "{$originalWidth}x{$originalHeight}",
                    'final_size' => $filesize,
                    'converted' => $converted,
                ]);
            }

            return new ImageProcessResult(
                relativePath: $relativePath,
                url: $url,
                filename: $filename,
                filesize: $filesize,
                mimeType: "image/{$finalExtension}",
                dimensions: [
                    'width' => $finalWidth,
                    'height' => $finalHeight,
                ],
                converted: $converted,
                originalExtension: $originalExtension
            );
        } catch (\Exception $e) {
            if ($this->config['logging']['enabled']) {
                Log::channel($this->config['logging']['channel'])
                    ->error('Image processing failed', [
                        'type' => $type,
                        'error' => $e->getMessage(),
                    ]);
            }
            throw $e;
        }
    }

    /**
     * Delete an image file
     */
    public function delete(?string $relativePath): bool
    {
        if (!$relativePath) {
            return false;
        }

        try {
            $disk = Storage::disk($this->config['disk']);
            if ($disk->exists($relativePath)) {
                $disk->delete($relativePath);

                if ($this->config['logging']['enabled']) {
                    Log::channel($this->config['logging']['channel'])->info('Image deleted', [
                        'path' => $relativePath,
                    ]);
                }

                return true;
            }
        } catch (\Exception $e) {
            if ($this->config['logging']['enabled']) {
                Log::channel($this->config['logging']['channel'])->error('Image deletion failed', [
                    'path' => $relativePath,
                    'error' => $e->getMessage(),
                ]);
            }
        }

        return false;
    }

    /**
     * Download an image from an external URL and process it through the pipeline.
     *
     * @param string $url External image URL
     * @param string $type Image type (products, reviews, banners, etc)
     * @param int $timeout Download timeout in seconds
     * @return ImageProcessResult
     * @throws \Exception
     */
    public function processFromUrl(string $url, string $type = 'default', int $timeout = 30): ImageProcessResult
    {
        $tempFile = null;
        try {
            // Validate URL
            if (!filter_var($url, FILTER_VALIDATE_URL)) {
                throw new \Exception("Invalid URL: {$url}");
            }

            // Download the image to a temp file
            $context = stream_context_create([
                'http' => [
                    'timeout' => $timeout,
                    'user_agent' => 'Laravel/ImageService',
                ],
                'ssl' => [
                    'verify_peer' => false,
                    'verify_peer_name' => false,
                ],
            ]);

            $imageData = @file_get_contents($url, false, $context);
            if ($imageData === false) {
                throw new \Exception("Failed to download image from: {$url}");
            }

            // Write to temp file
            $tempFile = tempnam(sys_get_temp_dir(), 'img_');
            file_put_contents($tempFile, $imageData);

            // Detect extension from content type or URL
            $finfo = new \finfo(FILEINFO_MIME_TYPE);
            $mimeType = $finfo->file($tempFile);
            $extensionMap = [
                'image/jpeg' => 'jpg',
                'image/png' => 'png',
                'image/webp' => 'webp',
                'image/gif' => 'gif',
            ];
            $extension = $extensionMap[$mimeType] ?? pathinfo(parse_url($url, PHP_URL_PATH), PATHINFO_EXTENSION) ?: 'jpg';

            // Rename temp file with correct extension so getExtension() works
            $tempWithExt = $tempFile . '.' . $extension;
            rename($tempFile, $tempWithExt);
            $tempFile = $tempWithExt;

            // Process through standard pipeline
            return $this->process($tempFile, $type);
        } finally {
            // Clean up temp file
            if ($tempFile && file_exists($tempFile)) {
                @unlink($tempFile);
            }
        }
    }

    /**
     * Process an image from raw binary content.
     *
     * @param string $content Raw image binary data
     * @param string $type Image type (products, reviews, banners, etc)
     * @param string $extension Original extension hint
     * @return ImageProcessResult
     * @throws \Exception
     */
    public function processFromContent(string $content, string $type = 'default', string $extension = 'jpg'): ImageProcessResult
    {
        $tempFile = null;
        try {
            $tempFile = tempnam(sys_get_temp_dir(), 'img_') . '.' . $extension;
            file_put_contents($tempFile, $content);

            return $this->process($tempFile, $type);
        } finally {
            if ($tempFile && file_exists($tempFile)) {
                @unlink($tempFile);
            }
        }
    }

    /**
     * Get full URL for a relative path
     */
    public function getUrl(?string $relativePath): ?string
    {
        if (!$relativePath) {
            return null;
        }

        // If it's already a full URL, return as-is
        if (filter_var($relativePath, FILTER_VALIDATE_URL)) {
            return $relativePath;
        }

        // Build storage URL
        $url = '/storage/' . ltrim($relativePath, '/');

        // Add cache busting if enabled
        if ($this->config['cache_busting']) {
            try {
                $disk = Storage::disk($this->config['disk']);
                if ($disk->exists($relativePath)) {
                    $lastModified = $disk->lastModified($relativePath);
                    return $url . '?v=' . $lastModified;
                }
            } catch (\Exception $e) {
                // Silently fail, return URL without cache buster
            }
        }

        return $url;
    }

    /**
     * Resize image to fit within max dimensions
     * Returns the resized Image object (not encoded yet)
     */
    private function optimize(Image $image, array $typeConfig): Image
    {
        // Resize if needed
        if ($image->width() > $typeConfig['max_width'] || $image->height() > $typeConfig['max_height']) {
            $image->scaleDown(
                width: $typeConfig['max_width'],
                height: $typeConfig['max_height']
            );
        }

        // Metadata stripping is handled automatically by Intervention Image v3
        // stripExif() method is not available in v3, but EXIF data handling is built-in

        return $image;
    }

    /**
     * Encode resized image to target format (WebP or original) and save to disk.
     * Handles the Intervention Image v3 API correctly:
     * - toWebp() / toJpeg() / toPng() return EncodedImage objects
     * - Only EncodedImage has the save() method
     */
    private function encodeAndSave(Image $image, string $fullPath, array $typeConfig): void
    {
        $quality = $typeConfig['quality'];

        if ($this->config['convert_to_webp']) {
            // toWebp() returns an EncodedImage object with save() method
            $encoded = $image->toWebp(quality: $quality);
            $encoded->save($fullPath);
        } else {
            // toJpeg() returns an EncodedImage object with save() method
            $encoded = $image->toJpeg(quality: $quality);
            $encoded->save($fullPath);
        }
    }

    /**
     * Validate image file
     */
    private function validateImage($file, array $typeConfig): void
    {
        // Check file size
        $filesize = is_string($file) ? filesize($file) : $file->getSize();
        if ($filesize > $typeConfig['max_file_size']) {
            throw new \Exception(
                "File size {$filesize} exceeds maximum {$typeConfig['max_file_size']}"
            );
        }

        // Check MIME type
        $mimeType = $this->getMimeType($file);
        if (!in_array($mimeType, $typeConfig['allowed_mimes'])) {
            throw new \Exception(
                "MIME type {$mimeType} not allowed for type '{$typeConfig['path']}'. " .
                "Allowed: " . implode(', ', $typeConfig['allowed_mimes'])
            );
        }
    }

    /**
     * Get type-specific configuration
     */
    private function getTypeConfig(string $type): array
    {
        return $this->config['types'][$type] ?? $this->config['default_type'];
    }

    /**
     * Generate unique filename
     */
    private function generateFilename(string $type, string $extension): string
    {
        $strategy = $this->config['filename_strategy'];

        if ($strategy === 'hash') {
            $hash = Str::random(32);
            return $hash . '.' . strtolower($extension);
        } elseif ($strategy === 'timestamp') {
            $timestamp = time();
            return "{$timestamp}_" . Str::random(8) . '.' . strtolower($extension);
        } else {
            // 'original' strategy - use random prefix to avoid collisions
            return Str::random(8) . '_' . Str::random(8) . '.' . strtolower($extension);
        }
    }

    /**
     * Get file extension
     */
    private function getExtension($file): string
    {
        if ($file instanceof UploadedFile) {
            return $file->getClientOriginalExtension();
        } elseif (is_string($file)) {
            return pathinfo($file, PATHINFO_EXTENSION);
        }
        return 'jpg';
    }

    /**
     * Get MIME type
     */
    private function getMimeType($file): string
    {
        if ($file instanceof UploadedFile) {
            return $file->getMimeType();
        } elseif (is_string($file)) {
            return mime_content_type($file) ?: 'image/jpeg';
        }
        return 'image/jpeg';
    }
}
