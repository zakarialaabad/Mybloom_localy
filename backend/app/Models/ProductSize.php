<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductSize extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'product_id',
        'label',
        'price_modifier',
        'promotion_percent',
        'stock',
    ];

    protected function casts(): array
    {
        return [
            'price_modifier'   => 'decimal:2',
            'promotion_percent' => 'decimal:2',
            'stock'            => 'integer',
        ];
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
