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
     * - Paths that already start with http(s) are returned as-is (legacy / external URLs).
     * - Everything else is served from Laravel's public disk via asset('storage/…').
     */
    public function getImageUrlAttribute(): string
    {
        if (str_starts_with($this->image_path, 'http://') || str_starts_with($this->image_path, 'https://')) {
            return $this->image_path;
        }

        return asset('storage/' . $this->image_path);
    }
}
