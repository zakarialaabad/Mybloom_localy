<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Str;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_number',
        'coupon_id',
        'shipping_method_id',
        'customer_name',
        'customer_phone',
        'customer_email',
        'shipping_address',
        'shipping_city',
        'shipping_province',
        'shipping_postal_code',
        'subtotal',
        'discount_amount',
        'shipping_cost',
        'total',
        'status',
        'notes',
        'admin_notes',
        'payment_method',
        'payment_status',
        'whatsapp_confirmation_requested',
        'whatsapp_consent_at',
        'whatsapp_consent_source',
        'whatsapp_confirmation_status',
        'whatsapp_confirmation_message_id',
        'whatsapp_confirmation_sent_at',
        'whatsapp_confirmation_failed_at',
        'whatsapp_confirmation_error',
        'whatsapp_invoice_status',
        'whatsapp_invoice_message_id',
        'whatsapp_invoice_sent_at',
        'whatsapp_invoice_failed_at',
        'whatsapp_invoice_error',
    ];

    protected function casts(): array
    {
        return [
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'shipping_cost' => 'decimal:2',
            'total' => 'decimal:2',
            'whatsapp_confirmation_requested' => 'boolean',
            'whatsapp_consent_at' => 'datetime',
            'whatsapp_confirmation_sent_at' => 'datetime',
            'whatsapp_confirmation_failed_at' => 'datetime',
            'whatsapp_invoice_sent_at' => 'datetime',
            'whatsapp_invoice_failed_at' => 'datetime',
        ];
    }

    // ── Auto-generate order number on create ──────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'LX-'
                    .strtoupper(Str::random(4))
                    .'-'
                    .strtoupper(Str::random(3));
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at');
    }

    public function whatsappNotifications(): HasMany
    {
        return $this->hasMany(OrderWhatsAppNotification::class);
    }

    public function whatsappDeliveries(): HasMany
    {
        return $this->hasMany(OrderWhatsAppDelivery::class);
    }

    public function adminWhatsAppNotification(): HasOne
    {
        return $this->hasOne(AdminOrderWhatsAppNotification::class);
    }

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }
}
