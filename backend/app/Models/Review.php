<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'order_number',
        'reviewer_name',
        'rating',
        'body',
        'is_approved',
        'approved_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'rating'      => 'integer',
            'is_approved' => 'boolean',
            'approved_at' => 'datetime',
            'status'      => 'string', // pending, approved, traiter
        ];
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * Lookup order by order_number to get customer phone
     * Used when displaying review author contact info
     */
    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class, 'order_number', 'order_number');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ReviewImage::class);
    }
}
