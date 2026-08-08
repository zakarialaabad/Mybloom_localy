<?php

declare(strict_types=1);

namespace App\Jobs;

use App\Models\Order;
use App\Models\OrderWhatsAppDelivery;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class MarkOpenWaDeliveryUnconfirmed implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public function __construct(private readonly int $deliveryId) {}

    public function handle(): void
    {
        $delivery = OrderWhatsAppDelivery::find($this->deliveryId);
        if (! $delivery || ! in_array($delivery->status, ['accepted', 'sent'], true)) {
            return;
        }
        $delivery->update(['status' => 'unconfirmed', 'fallback_available_at' => now()]);
        Order::whereKey($delivery->order_id)->update(['whatsapp_confirmation_status' => 'unconfirmed']);
    }
}
