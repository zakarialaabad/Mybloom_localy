<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class OrderWhatsAppDelivery extends Model
{
    public const PURPOSE_CONFIRMATION = 'order_confirmation';

    protected $table = 'order_whatsapp_deliveries';

    protected $fillable = [
        'order_id', 'purpose', 'recipient_original', 'recipient_e164', 'canonical_chat_id',
        'consent_at', 'status', 'message_id', 'fallback_message_id', 'auto_attempted_at',
        'sent_at', 'delivered_at', 'read_at', 'fallback_available_at', 'fallback_token_hash',
        'fallback_expires_at', 'fallback_used_at', 'customer_initiated_at', 'failed_at', 'attempt_count', 'last_error_code',
        'last_error_message', 'invoice_url', 'invoice_expires_at',
    ];

    protected $hidden = ['fallback_token_hash', 'invoice_url'];

    protected function casts(): array
    {
        return [
            'consent_at' => 'datetime', 'auto_attempted_at' => 'datetime', 'sent_at' => 'datetime',
            'delivered_at' => 'datetime', 'read_at' => 'datetime', 'fallback_available_at' => 'datetime',
            'fallback_expires_at' => 'datetime', 'fallback_used_at' => 'datetime', 'customer_initiated_at' => 'datetime',
            'failed_at' => 'datetime', 'invoice_expires_at' => 'datetime',
            'attempt_count' => 'integer', 'invoice_url' => 'encrypted',
        ];
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function fallbackIsAvailable(): bool
    {
        return $this->fallback_available_at !== null && $this->fallback_expires_at?->isFuture() === true;
    }
}
