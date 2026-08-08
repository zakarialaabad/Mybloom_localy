<?php

declare(strict_types=1);

namespace App\Services\OpenWa;

final readonly class OpenWaSendResult
{
    public function __construct(
        public ?string $messageId,
        public int $httpStatus,
        public array $body,
    ) {}
}
