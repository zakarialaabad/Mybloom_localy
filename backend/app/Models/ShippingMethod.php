<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ShippingMethod extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'price',
        'free_over',
        'is_active',
        'sort_order',
    ];

    protected function casts(): array
    {
        return [
            'price'      => 'decimal:2',
            'free_over'  => 'decimal:2',
            'is_active'  => 'boolean',
            'sort_order' => 'integer',
        ];
    }
}
