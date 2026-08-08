<?php

namespace App\Http\Requests;

use App\Support\WhatsAppPhone;
use Illuminate\Foundation\Http\FormRequest;
use InvalidArgumentException;

class StoreOrderRequest extends FormRequest
{
    protected function prepareForValidation(): void
    {
        $phone = (string) $this->input('customer_phone', '');

        if (trim($phone) === '') {
            return;
        }

        try {
            $this->merge([
                'customer_phone_original' => $phone,
                'customer_phone' => WhatsAppPhone::normalizeMoroccan($phone),
            ]);
        } catch (InvalidArgumentException) {
            // Let the validation rule below return a normal 422 response.
        }
    }

    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    public function rules(): array
    {
        return [
            'shipping_method_id' => ['required', 'exists:shipping_methods,id'],
            'coupon_code' => ['nullable', 'string', 'max:50'],

            // Customer
            'customer_name' => ['required', 'string', 'max:150'],
            'customer_phone' => [
                'required',
                'string',
                'max:20',
                function (string $attribute, mixed $value, \Closure $fail): void {
                    try {
                        $phone = WhatsAppPhone::normalizeMoroccan((string) $value);
                    } catch (InvalidArgumentException) {
                        $fail('Please enter a valid Moroccan mobile WhatsApp number.');

                        return;
                    }

                    if ($phone === (string) config('services.openwa.owner_e164')) {
                        $fail('The customer WhatsApp number cannot be the MyBloom sender number.');
                    }
                },
            ],
            // Populated server-side in prepareForValidation; kept separately
            // from normalized digits for operational audit.
            'customer_phone_original' => ['nullable', 'string', 'max:50'],
            'customer_email' => ['nullable', 'email', 'max:200'],
            // This is transactional-message consent, recorded with the order.
            // Transactional confirmation consent is stored with the order.
            'whatsapp_confirmation_requested' => ['required', 'accepted'],

            // Shipping address — sent as nested object from the frontend
            'shipping_address' => ['required', 'array'],
            'shipping_address.address' => ['required', 'string', 'max:300'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.quartier' => ['nullable', 'string', 'max:100'],
            'shipping_address.zip' => ['nullable', 'string', 'max:20'],

            // Notes
            'notes' => ['nullable', 'string', 'max:1000'],

            // Items — frontend sends size_id; price is resolved server-side
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'exists:products,id'],
            // Allow size_id to be nullable or 0 (for products without variants)
            // Service resolves and validates variant ownership; stale IDs fall back gracefully
            'items.*.size_id' => ['nullable', 'integer'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
        ];
    }
}
