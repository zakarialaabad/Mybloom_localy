<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderWhatsAppNotification extends Model
{
    protected $table = 'order_whatsapp_notifications';

    protected $fillable = [
        'order_id',
        'channel',
        'message_type',
        'provider',
        'recipient_e164',
        'status',
        'provider_message_id',
        'attempt_count',
        'accepted_at',
        'delivered_at',
        'failed_at',
        'invoice_link_created_at',
        'invoice_link_expires_at',
        'last_error_code',
        'last_error_message',
    ];

    protected function casts(): array
    {
        return [
            'attempt_count' => 'integer',
            'accepted_at' => 'datetime',
            'delivered_at' => 'datetime',
            'failed_at' => 'datetime',
            'invoice_link_created_at' => 'datetime',
            'invoice_link_expires_at' => 'datetime',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
