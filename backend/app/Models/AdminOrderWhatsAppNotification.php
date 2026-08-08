<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

final class AdminOrderWhatsAppNotification extends Model
{
    protected $table = 'admin_order_whatsapp_notifications';

    protected $fillable = [
        'order_id', 'recipient_e164', 'canonical_chat_id', 'status', 'message_id',
        'attempted_at', 'accepted_at', 'delivered_at', 'read_at', 'failed_at',
        'attempt_count', 'last_error_code', 'last_error_message',
    ];

    protected function casts(): array
    {
        return [
            'attempted_at' => 'datetime',
            'accepted_at' => 'datetime',
            'delivered_at' => 'datetime',
            'read_at' => 'datetime',
            'failed_at' => 'datetime',
            'attempt_count' => 'integer',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }
}
