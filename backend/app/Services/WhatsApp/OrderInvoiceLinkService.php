<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use App\Models\Order;
use App\Services\OpenWa\OpenWaException;
use Illuminate\Support\Facades\URL;

final class OrderInvoiceLinkService
{
    public function create(Order $order): OrderInvoiceLink
    {
        $origin = $this->publicOrigin();
        $expiresAt = now()->addDays((int) config('services.openwa.invoice_link_expiry_days', 7));
        $relativeUrl = URL::temporarySignedRoute(
            'v1.invoices.whatsapp-download',
            $expiresAt,
            ['orderNumber' => $order->order_number],
            absolute: false,
        );

        return new OrderInvoiceLink($origin.$relativeUrl, $expiresAt);
    }

    private function publicOrigin(): string
    {
        $url = rtrim((string) config('services.openwa.invoice_public_url'), '/');
        $parts = parse_url($url);
        $scheme = is_array($parts) ? strtolower((string) ($parts['scheme'] ?? '')) : '';
        $host = is_array($parts) ? strtolower((string) ($parts['host'] ?? '')) : '';

        $localLanHttp = app()->environment('local')
            && $scheme === 'http'
            && $this->isLanHost($host);

        if (($scheme !== 'https' && ! $localLanHttp) || $host === '' || in_array($host, ['localhost', '127.0.0.1', '::1'], true)) {
            throw new OpenWaException(
                'A public HTTPS invoice origin is required for WhatsApp delivery.',
                false,
                null,
                'invoice_public_url_invalid',
            );
        }

        return $url;
    }

    private function isLanHost(string $host): bool
    {
        if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) === false) {
            return false;
        }

        return filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false;
    }
}
