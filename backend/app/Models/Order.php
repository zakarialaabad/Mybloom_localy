<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
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
        'whatsapp_opt_in',
    ];

    protected function casts(): array
    {
        return [
            'subtotal'        => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'shipping_cost'   => 'decimal:2',
            'total'           => 'decimal:2',
            'whatsapp_opt_in' => 'boolean',
        ];
    }

    // ── Auto-generate order number on create ──────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (Order $order) {
            if (empty($order->order_number)) {
                $order->order_number = 'LX-'
                    . strtoupper(Str::random(4))
                    . '-'
                    . strtoupper(Str::random(3));
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

    public function shippingMethod(): BelongsTo
    {
        return $this->belongsTo(ShippingMethod::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }
}
