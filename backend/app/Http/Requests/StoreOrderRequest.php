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
            'shipping_method_id'   => ['required', 'exists:shipping_methods,id'],
            'coupon_code'          => ['nullable', 'string', 'max:50'],

            // Customer
            'customer_name'        => ['required', 'string', 'max:150'],
            'customer_phone'       => ['required', 'string', 'max:20'],
            'customer_email'       => ['nullable', 'email', 'max:200'],

            // Shipping address
            'shipping_address'     => ['required', 'string', 'max:300'],
            'shipping_city'        => ['required', 'string', 'max:100'],
            'shipping_province'    => ['nullable', 'string', 'max:100'],
            'shipping_postal_code' => ['nullable', 'string', 'max:20'],

            // Notes
            'notes'                => ['nullable', 'string', 'max:1000'],

            // Items
            'items'                     => ['required', 'array', 'min:1'],
            'items.*.product_id'        => ['required', 'exists:products,id'],
            'items.*.size_label'        => ['nullable', 'string', 'max:50'],
            'items.*.quantity'          => ['required', 'integer', 'min:1'],
            'items.*.unit_price'        => ['required', 'numeric', 'min:0'],
        ];
    }
}
