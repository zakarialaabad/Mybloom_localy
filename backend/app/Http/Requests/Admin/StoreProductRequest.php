<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Route already protected by ensure.admin middleware
    }

    public function rules(): array
    {
        return [
            'brand_id'          => ['nullable', 'exists:brands,id'],
            'category_id'       => ['nullable', 'exists:categories,id'],
            'product_type_id'   => ['nullable', 'exists:product_types,id'],
            'name'              => ['required', 'string', 'max:200'],
            'subtitle'          => ['nullable', 'string', 'max:300'],
            'description'       => ['nullable', 'string'],
            'ingredients'       => ['nullable', 'string'],
            'manual_ingredients'=> ['nullable', 'string'],
            'gender'            => ['nullable', Rule::in(['men', 'women', 'unisex', 'Men', 'Women', 'Unisex'])],
            'price'             => ['nullable', 'numeric', 'min:0'],
            'original_price'    => ['nullable', 'numeric', 'min:0'],
            'stock'             => ['nullable', 'integer', 'min:0'],
            'is_active'         => ['nullable', 'boolean'],
            'is_featured'       => ['nullable', 'boolean'],
            'is_best_seller'    => ['nullable', 'boolean'],
            'is_gift'           => ['nullable', 'boolean'],
            'is_recommended'    => ['nullable', 'boolean'],
            'variants'          => ['nullable', 'string'],
            'faqs'              => ['nullable', 'string'],
            'reviews_array'     => ['nullable', 'string'],
            'images'            => ['nullable', 'array'],
            'images.*'          => ['image', 'max:5120'],
        ];
    }
}
