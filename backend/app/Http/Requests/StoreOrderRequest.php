<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    public function rules(): array
    {
        return [
            'shipping_method_id'               => ['required', 'exists:shipping_methods,id'],
            'coupon_code'                      => ['nullable', 'string', 'max:50'],

            // Customer
            'customer_name'                    => ['required', 'string', 'max:150'],
            'customer_phone'                   => ['required', 'string', 'max:20'],
            'customer_email'                   => ['nullable', 'email', 'max:200'],

            // Shipping address — sent as nested object from the frontend
            'shipping_address'                 => ['required', 'array'],
            'shipping_address.address'         => ['required', 'string', 'max:300'],
            'shipping_address.city'            => ['required', 'string', 'max:100'],
            'shipping_address.quartier'        => ['nullable', 'string', 'max:100'],
            'shipping_address.zip'             => ['nullable', 'string', 'max:20'],

            // Notes
            'notes'                            => ['nullable', 'string', 'max:1000'],

            // Items — frontend sends size_id; price is resolved server-side
            'items'                            => ['required', 'array', 'min:1'],
            'items.*.product_id'               => ['required', 'exists:products,id'],
            // Allow size_id to be nullable or 0 (for products without variants)
            // If provided (>0), must exist in product_sizes
            'items.*.size_id'                  => [
                'nullable', 
                'integer', 
                function ($attribute, $value, $fail) {
                    if (! $value || $value <= 0) {
                        return;
                    }

                    $variantExists = \App\Models\ProductVariant::where('id', $value)->exists();
                    $sizeExists = \App\Models\ProductSize::where('id', $value)->exists();

                    if (! $variantExists && ! $sizeExists) {
                        $fail('The selected size is invalid.');
                    }
                }
            ],
            'items.*.quantity'                 => ['required', 'integer', 'min:1'],
        ];
    }
}
