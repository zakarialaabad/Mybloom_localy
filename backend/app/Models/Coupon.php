<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Coupon extends Model
{
    protected $fillable = [
        'code',
        'type',
        'value',
        'min_order_amount',
        'usage_limit',
        'used_count',
        'expires_at',
        'is_active',
    ];

    protected function casts(): array
    {
        return [
            'value'            => 'decimal:2',
            'min_order_amount' => 'decimal:2',
            'usage_limit'      => 'integer',
            'used_count'       => 'integer',
            'expires_at'       => 'datetime',
            'is_active'        => 'boolean',
        ];
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isExhausted(): bool
    {
        return $this->usage_limit !== null && $this->used_count >= $this->usage_limit;
    }

    public function isUsable(): bool
    {
        return $this->is_active && ! $this->isExpired() && ! $this->isExhausted();
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }
}
