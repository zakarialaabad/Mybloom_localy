<?php

declare(strict_types=1);

namespace App\Services\WhatsApp;

use Carbon\CarbonInterface;

final readonly class OrderInvoiceLink
{
    public function __construct(
        public string $url,
        public CarbonInterface $expiresAt,
    ) {}
}
