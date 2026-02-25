<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProductRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'brand_id'       => ['nullable', 'exists:brands,id'],
            'category_id'    => ['nullable', 'exists:categories,id'],
            'name'           => ['sometimes', 'string', 'max:200'],
            'subtitle'       => ['nullable', 'string', 'max:300'],
            'description'    => ['nullable', 'string'],
            'ingredients'    => ['nullable', 'string'],
            'gender'         => ['sometimes', Rule::in(['men', 'women', 'unisex'])],
            'price'          => ['sometimes', 'numeric', 'min:0'],
            'original_price' => ['nullable', 'numeric', 'min:0'],
            'stock'          => ['sometimes', 'integer', 'min:0'],
            'is_active'      => ['nullable', 'boolean'],
            'is_featured'    => ['nullable', 'boolean'],
        ];
    }
}
