<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Models\Order;

final class OrderWhatsAppMessageBuilder
{
    /**
     * Build exclusively from order/item snapshots saved by Laravel. The
     * checkout browser is never trusted for products, prices, or totals.
     */
    public function build(Order $order, string $invoiceUrl): string
    {
        $order->loadMissing('items', 'shippingMethod');

        $itemLines = $order->items->map(function ($item): string {
            $name = $this->clean((string) ($item->product_name ?: $item->product?->name));
            $size = $item->size_label ? ' - '.$this->clean((string) $item->size_label) : '';
            $unitPrice = (float) ($item->unit_price ?? 0);
            $unit = $this->money($unitPrice);
            $lineTotal = $this->money($unitPrice * (int) $item->quantity);

            return '- '.$name.$size.' | '.(int) $item->quantity.' x '.$unit.' MAD = '.$lineTotal.' MAD';
        })->values();

        $delivery = trim(implode(', ', array_filter([
            $this->clean((string) $order->shipping_address),
            $this->clean((string) $order->shipping_city),
            $this->clean((string) $order->shipping_province),
            $this->clean((string) $order->shipping_postal_code),
        ])));

        $header = [
            'Bonjour '.$this->clean((string) $order->customer_name).',',
            'Votre commande MyBloom est confirmee.',
            'Commande : #'.$this->clean((string) $order->order_number),
            'Livraison : '.$delivery,
            '',
            'Produits :',
        ];
        $footer = [
            '',
            'Sous-total : '.$this->money((float) $order->subtotal).' MAD',
            'Remise : -'.$this->money((float) $order->discount_amount).' MAD',
            'Livraison : '.$this->money((float) $order->shipping_cost).' MAD',
            'Total : '.$this->money((float) $order->total).' MAD',
            'Paiement : '.($order->payment_method === 'cash_on_delivery'
                ? 'Paiement a la livraison'
                : $this->clean((string) $order->payment_method)),
            'Statut du paiement : '.$this->clean((string) $order->payment_status),
            '',
            'Telecharger votre facture securisee :',
            $invoiceUrl,
            '',
            'Merci pour votre confiance,',
            'MyBloom',
        ];

        // WhatsApp text is limited to 4096 characters. Reserve space for the
        // totals and signed invoice URL so a large cart can never cut the URL.
        $parts = $header;
        $budget = max(0, 4096 - mb_strlen(implode("\n", array_merge($header, $footer))) - 100);
        $used = 0;
        $omitted = 0;
        foreach ($itemLines as $line) {
            $length = mb_strlen($line) + 1;
            if ($used + $length > $budget) {
                $omitted++;

                continue;
            }
            $parts[] = $line;
            $used += $length;
        }
        if ($omitted > 0) {
            $parts[] = '- '.$omitted.' article(s) supplementaire(s) : voir la facture.';
        }

        return implode("\n", array_merge($parts, $footer));
    }

    private function clean(string $value): string
    {
        return trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '');
    }

    private function money(float $value): string
    {
        return number_format($value, 2, '.', ' ');
    }
}
