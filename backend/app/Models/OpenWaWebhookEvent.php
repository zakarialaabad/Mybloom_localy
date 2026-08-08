<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class OpenWaWebhookEvent extends Model
{
    protected $table = 'openwa_webhook_events';

    protected $fillable = ['event_key', 'event_type', 'session_id', 'payload', 'processed_at'];

    protected function casts(): array
    {
        return ['payload' => 'encrypted:array', 'processed_at' => 'datetime'];
    }
}
