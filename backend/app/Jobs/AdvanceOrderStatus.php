<?php

namespace App\Jobs;

use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

/**
 * Automatically advances an order to the next status after a delay.
 *
 * Dispatch chain:
 *   confirmed  --[6h]--> preparing  --[3h]--> shipped
 *   shipped    <-- manual only ("Mark as Delivered") --> delivered
 *
 * The job aborts silently if the order was already advanced
 * (e.g. admin manually changed status) or cancelled.
 */
class AdvanceOrderStatus implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * @param int    $orderId        The order to advance
     * @param string $fromStatus     The expected current status (guard against double-advance)
     * @param string $toStatus       The status to advance to
     */
    public function __construct(
        private readonly int    $orderId,
        private readonly string $fromStatus,
        private readonly string $toStatus,
    ) {}

    public function handle(OrderService $orderService): void
    {
        $order = Order::find($this->orderId);

        // Abort if the order was deleted, cancelled, or already manually advanced
        if (! $order || $order->status !== $this->fromStatus) {
            return;
        }

        $statusLabels = [
            'preparing' => 'Your order is being carefully prepared and packed.',
            'shipped'   => 'Your order is out for delivery and on the way to you.',
        ];

        $orderService->recordStatusChange(
            $order,
            $this->toStatus,
            $statusLabels[$this->toStatus] ?? ucfirst($this->toStatus),
        );

        // Chain: if we just set "preparing", schedule the next advance to "shipped" in 3h
        if ($this->toStatus === 'preparing') {
            self::dispatch($order->id, 'preparing', 'shipped')
                ->delay(now()->addHours(3));
        }
    }
}
