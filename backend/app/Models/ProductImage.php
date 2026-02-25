<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductImage extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'url',
        'alt',
        'sort_order',
        'is_primary',
    ];

    protected function casts(): array
    {
        return [
            'is_primary'   => 'boolean',
            'sort_order'   => 'integer',
            'created_at'   => 'datetime',
        ];
    }

    const CREATED_AT = 'created_at';
    const UPDATED_AT = null;

    // ── Relationships ─────────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
