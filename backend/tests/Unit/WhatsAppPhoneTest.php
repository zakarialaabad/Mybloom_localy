<?php

namespace Tests\Unit;

use App\Support\WhatsAppPhone;
use InvalidArgumentException;
use Tests\TestCase;

class WhatsAppPhoneTest extends TestCase
{
    public function test_it_normalizes_moroccan_checkout_numbers_to_digits_only_e164(): void
    {
        foreach (['+212 720-356971', '00212 720 356 971', '0720356971'] as $phone) {
            $this->assertSame('212720356971', WhatsAppPhone::normalizeMoroccan($phone));
        }
    }

    public function test_it_rejects_landline_and_ambiguous_numbers(): void
    {
        $this->expectException(InvalidArgumentException::class);
        WhatsAppPhone::normalizeMoroccan('0522 00 00 00');
    }
}
