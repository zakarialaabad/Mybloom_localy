<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ReviewImage extends Model
{
    public $timestamps = false;

    const CREATED_AT = 'created_at';

    protected $fillable = [
        'review_id',
        'url',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function review(): BelongsTo
    {
        return $this->belongsTo(Review::class);
    }
}
