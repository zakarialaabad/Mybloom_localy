<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Models\Order;

/** Formats only persisted order snapshots for the fixed internal recipient. */
final class AdminOrderWhatsAppMessageBuilder
{
    public function build(Order $order): string
    {
        $order->loadMissing('items');

        $items = $order->items->map(function ($item): string {
            $name = $this->clean((string) $item->product_name);
            $size = $item->size_label ? ' - '.$this->clean((string) $item->size_label) : '';
            $lineTotal = (float) $item->unit_price * (int) $item->quantity;

            return '• '.$name.$size.' × '.(int) $item->quantity.' — '.$this->money($lineTotal).' MAD';
        })->all();

        return implode("\n", array_merge([
            '🛍️ Nouvelle commande MyBloom',
            '',
            'Commande : #'.$this->clean((string) $order->order_number),
            'Date : '.($order->created_at?->format('d/m/Y H:i') ?? ''),
            '',
            'Client : '.$this->clean((string) $order->customer_name),
            'Téléphone : '.$this->clean((string) $order->customer_phone),
            'Ville : '.$this->clean((string) $order->shipping_city),
            'Adresse : '.$this->address($order),
            '',
            'Produits :',
        ], $items, [
            '',
            'Sous-total : '.$this->money((float) $order->subtotal).' MAD',
            'Livraison : '.$this->money((float) $order->shipping_cost).' MAD',
            'Remise : '.$this->money((float) $order->discount_amount).' MAD',
            'Total : '.$this->money((float) $order->total).' MAD',
            '',
            'Paiement : '.$this->paymentMethod((string) $order->payment_method),
            'Statut : '.$this->clean((string) $order->status),
        ]));
    }

    private function address(Order $order): string
    {
        return implode(', ', array_filter([
            $this->clean((string) $order->shipping_address),
            $this->clean((string) $order->shipping_province),
            $this->clean((string) $order->shipping_postal_code),
        ]));
    }

    private function paymentMethod(string $method): string
    {
        return $method === 'cash_on_delivery' ? 'Paiement à la livraison' : $this->clean($method);
    }

    private function clean(string $value): string
    {
        return trim(preg_replace('/[\x00-\x1F\x7F]+/u', ' ', $value) ?? '');
    }

    private function money(float $value): string
    {
        return number_format($value, 2, ',', ' ');
    }
}
