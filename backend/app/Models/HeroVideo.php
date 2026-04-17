<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroVideo extends Model
{
    protected $fillable = [
        'path',
        'compressed_path',
        'thumbnail_path',
        'compressed_at',
        'type',
        'display_order',
        'is_active',
        'is_legacy',
    ];

    protected $casts = [
        'is_active'     => 'boolean',
        'is_legacy'     => 'boolean',
        'compressed_at' => 'datetime',
    ];
}
