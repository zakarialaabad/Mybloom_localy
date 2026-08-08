<?php

declare(strict_types=1);

namespace App\Support;

use InvalidArgumentException;
use libphonenumber\NumberParseException;
use libphonenumber\PhoneNumberFormat;
use libphonenumber\PhoneNumberUtil;

final class WhatsAppPhone
{
    /**
     * Returns digits-only E.164. Morocco is used only for a local number,
     * because checkout currently collects Moroccan shipping addresses.
     */
    public static function normalize(string $input, ?string $defaultRegion = 'MA'): string
    {
        $value = trim($input);
        if ($value === '') {
            throw new InvalidArgumentException('Customer phone is empty.');
        }

        if (str_starts_with($value, '00')) {
            $value = '+'.substr($value, 2);
        }
        // Composer installs this maintained implementation in production. The
        // constrained fallback keeps checkout validation available if a deploy
        // has not yet regenerated Composer's autoloader.
        if (! class_exists(PhoneNumberUtil::class)) {
            return self::fallbackNormalize($value, $defaultRegion);
        }
        $util = PhoneNumberUtil::getInstance();
        try {
            $number = $util->parse($value, str_starts_with($value, '+') ? null : $defaultRegion);
        } catch (NumberParseException) {
            throw new InvalidArgumentException('Invalid or ambiguous phone number.');
        }

        if (! $util->isPossibleNumber($number) || ! $util->isValidNumber($number)) {
            throw new InvalidArgumentException('Invalid or impossible phone number.');
        }

        return ltrim($util->format($number, PhoneNumberFormat::E164), '+');
    }

    public static function normalizeMoroccan(string $input): string
    {
        $digits = self::normalize($input, 'MA');
        if (! preg_match('/^212[67][0-9]{8}$/', $digits)) {
            throw new InvalidArgumentException('Checkout currently supports Moroccan phone numbers only.');
        }

        return $digits;
    }

    private static function fallbackNormalize(string $value, ?string $defaultRegion): string
    {
        $digits = preg_replace('/\D+/', '', $value) ?? '';
        if (str_starts_with($digits, '00')) {
            $digits = substr($digits, 2);
        }
        if (! str_starts_with($value, '+') && $defaultRegion === 'MA') {
            if (str_starts_with($digits, '0')) {
                $digits = '212'.substr($digits, 1);
            } elseif (strlen($digits) === 9) {
                $digits = '212'.$digits;
            }
        }
        if (! preg_match('/^[1-9][0-9]{7,14}$/', $digits)) {
            throw new InvalidArgumentException('Invalid or impossible phone number.');
        }

        return $digits;
    }
}
