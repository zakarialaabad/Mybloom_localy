<?php

namespace App\Services;

use App\DTOs\ImageProcessResult;
use Illuminate\Http\UploadedFile;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver;
use Intervention\Image\Image;
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

            // Optimize image
            $optimized = $this->optimize($image, $typeConfig);

            // Generate unique filename
            $filename = $this->generateFilename($type, $originalExtension);
            $relativePath = $typeConfig['path'] . '/' . $filename;
            $fullPath = $this->storagePath . '/' . $relativePath;

            // Ensure directory exists
            @mkdir(dirname($fullPath), 0755, true);

            // Save optimized image
            $optimized->save($fullPath);

            // Get final file size
            $filesize = filesize($fullPath);

            // Determine if converted to WebP
            $converted = $this->config['convert_to_webp'] && strtolower($originalExtension) !== 'webp';
            $finalExtension = $converted ? 'webp' : $originalExtension;

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
                    'width' => $optimized->width(),
                    'height' => $optimized->height(),
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
     * Optimize image - apply compression, resizing, WebP conversion
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

        // Strip metadata if enabled
        if ($this->config['strip_metadata']) {
            $image->stripExif();
        }

        // Convert to WebP if enabled and not already WebP
        if ($this->config['convert_to_webp']) {
            $image->toWebp($typeConfig['quality']);
        } else {
            // Set quality for JPEG/PNG
            if ($this->config['progressive_jpeg']) {
                $image->toJpeg($typeConfig['quality']);
            }
        }

        return $image;
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
