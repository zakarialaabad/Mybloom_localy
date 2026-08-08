<?php

declare(strict_types=1);

namespace App\Services\OpenWa;

use RuntimeException;

final class OpenWaException extends RuntimeException
{
    public function __construct(
        string $message,
        public readonly bool $retryable = false,
        public readonly ?int $httpStatus = null,
        public readonly ?string $errorCode = null,
    ) {
        parent::__construct($message);
    }
}
