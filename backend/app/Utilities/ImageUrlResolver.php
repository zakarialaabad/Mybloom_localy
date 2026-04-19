<?php

namespace App\Utilities;

class ImageUrlResolver
{
    /**
     * Resolve an image path to a full URL
     * Consolidates duplicate URL resolution logic from ProductResource, ReviewResource, OrderResource
     *
     * @param string|null $path Relative path (e.g., 'products/abc123.webp') or full URL
     * @param string|null $fallback Fallback URL if path is null/empty
     * @return string|null
     */
    public static function resolve(?string $path, ?string $fallback = null): ?string
    {
        // Return null if no path provided
        if (!$path) {
            return $fallback;
        }

        // Sanitize: strip embedded newlines/carriage-returns (from seeder copy-paste)
        $path = str_replace(["\r\n", "\r", "\n"], ' ', $path);
        $path = trim($path);
        if (!$path) {
            return $fallback;
        }

        // If it's already a full URL (contains scheme), return as-is
        if (self::isFullUrl($path)) {
            return $path;
        }

        // Paths served directly by the frontend (Next.js public folder)
        // These must NOT get the /storage/ prefix and stay relative.
        $frontendPaths = ['/images/', '/Brand/', '/INGRÉDIENTS/', '/Home background/', '/comments/'];
        foreach ($frontendPaths as $prefix) {
            if (str_starts_with($path, $prefix)) {
                return $path;
            }
        }

        // Backend public assets (exist in both frontend/Public and backend/public)
        // Case-insensitive check for /public_Image/ paths
        if (stripos($path, '/public_image/') === 0) {
            return rtrim(config('app.url'), '/') . $path;
        }

        // Build absolute storage URL from relative path
        // e.g. products/abc.jpg → http://localhost:8000/storage/products/abc.jpg
        // The frontend runs on a different port, so we must include the backend domain.
        $storagePath = '/storage/' . ltrim($path, '/');
        return rtrim(config('app.url'), '/') . $storagePath;
    }

    /**
     * Check if URL is absolute/full
     */
    public static function isFullUrl(string $url): bool
    {
        return filter_var($url, FILTER_VALIDATE_URL) !== false;
    }

    /**
     * Resolve multiple image paths
     * Useful for resolving arrays of images (review images, etc)
     *
     * @param array $paths Array of paths
     * @param string|null $fallback Fallback for each null value
     * @return array
     */
    public static function resolveMultiple(array $paths, ?string $fallback = null): array
    {
        return array_map(
            fn($path) => self::resolve($path, $fallback),
            $paths
        );
    }

    /**
     * Get storage URL with cache busting
     * Adds timestamp query parameter for cache invalidation
     *
     * @param string|null $path Relative path
     * @param bool $cacheBusting Enable cache busting
     * @return string|null
     */
    public static function resolveWithCacheBusting(?string $path, bool $cacheBusting = false): ?string
    {
        $url = self::resolve($path);

        if (!$url || !$cacheBusting) {
            return $url;
        }

        try {
            // Get last modified timestamp
            $diskPath = str_replace('/storage/', '', $url);
            $lastModified = \Illuminate\Support\Facades\Storage::disk('public')
                ->lastModified($diskPath);

            if ($lastModified) {
                return $url . '?v=' . $lastModified;
            }
        } catch (\Exception $e) {
            // Silently fail, return URL without cache buster
        }

        return $url;
    }

    /**
     * Verify if image file exists
     */
    public static function exists(?string $path): bool
    {
        if (!$path || self::isFullUrl($path)) {
            return false;
        }

        try {
            $diskPath = str_replace('/storage/', '', $path);
            return \Illuminate\Support\Facades\Storage::disk('public')->exists($diskPath);
        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Get image file size (bytes)
     */
    public static function getSize(?string $path): ?int
    {
        if (!self::exists($path)) {
            return null;
        }

        try {
            $diskPath = str_replace('/storage/', '', $path);
            return \Illuminate\Support\Facades\Storage::disk('public')->size($diskPath);
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get image dimensions
     * Requires path to be local file
     */
    public static function getDimensions(?string $path): ?array
    {
        if (!$path || !self::exists($path)) {
            return null;
        }

        try {
            $fullPath = \Illuminate\Support\Facades\Storage::disk('public')
                ->path(str_replace('/storage/', '', $path));

            if (!file_exists($fullPath)) {
                return null;
            }

            $size = getimagesize($fullPath);
            if ($size) {
                return [
                    'width' => $size[0],
                    'height' => $size[1],
                    'type' => $size[2], // IMAGETYPE_* constant
                ];
            }
        } catch (\Exception $e) {
            // Silently fail
        }

        return null;
    }

    /**
     * Normalize image path
     * Ensures consistent format (removes leading/trailing slashes, no /storage/ prefix)
     */
    public static function normalize(?string $path): ?string
    {
        if (!$path) {
            return null;
        }

        // Remove /storage/ prefix if present
        $path = str_replace('/storage/', '', $path);

        // Remove leading/trailing slashes
        $path = trim($path, '/');

        return $path ?: null;
    }
}
