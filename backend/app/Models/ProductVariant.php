<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductVariant extends Model
{
    protected $fillable = [
        'product_id',
        'size',
        'unit',
        'price',
        'promotion_percent',
        'stock_quantity',
        'is_default',
    ];

    protected function casts(): array
    {
        return [
            'size'              => 'integer',
            'unit'              => 'string',
            'price'             => 'decimal:2',
            'promotion_percent' => 'decimal:2',
            'stock_quantity'    => 'integer',
            'is_default'        => 'boolean',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }
}
