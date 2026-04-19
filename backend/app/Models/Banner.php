<?php

namespace App\Models;

use App\Utilities\ImageUrlResolver;
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
     * Delegates to centralized ImageUrlResolver for consistent URL resolution.
     */
    public function getImageUrlAttribute(): string
    {
        return ImageUrlResolver::resolve($this->image_path) ?? '';
    }
}
