<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Banner extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'image_path',
        'type',
        'collection_id',
        'position',
        'link',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'position'  => 'integer',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function collection(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'collection_id');
    }

    // ── Accessors ─────────────────────────────────────────────────────────────

    /**
     * Return a fully-qualified public URL for the stored image.
     * Normalizes embedded newline characters and resolves relative paths to absolute URLs.
     * 
     * Handles:
     *  - https://... (CDN / external) — returned as-is
     *  - http://...  (old IP/host) — host replaced with APP_URL  
     *  - /public_image/..., /public_Image/... (backend public assets) — prefixed with APP_URL
     *  - /storage/... (Laravel storage disk) — prefixed with APP_URL
     *  - Other paths — returned as-is
     */
    public function getImageUrlAttribute(): string
    {
        // Strip embedded newline characters from the stored path
        $path = str_replace(["\r\n", "\r", "\n"], '', $this->image_path);
        $path = trim($path);
        
        if (!$path) return '';
        
        // External HTTPS URLs — returned as-is
        if (str_starts_with($path, 'https://')) {
            return $path;
        }
        
        // HTTP URLs — replace host with APP_URL
        if (str_starts_with($path, 'http://')) {
            $urlPath = parse_url($path, PHP_URL_PATH) ?? '';
            return rtrim(config('app.url'), '/') . $urlPath;
        }
        
        // Backend public assets — check case-insensitively for common directories
        $lowerPath = strtolower($path);
        if (str_starts_with($lowerPath, '/public_image/') || str_starts_with($path, '/storage/')) {
            return rtrim(config('app.url'), '/') . $path;
        }
        
        // If path starts with / but not recognized — assume backend asset and prefix with APP_URL
        if (str_starts_with($path, '/')) {
            return rtrim(config('app.url'), '/') . $path;
        }
        
        // Relative path from Laravel storage disk (e.g., "banners/filename.jpg")
        // Stored via Storage::disk('public'), served at /storage/{path}
        return rtrim(config('app.url'), '/') . '/storage/' . $path;
    }
}
