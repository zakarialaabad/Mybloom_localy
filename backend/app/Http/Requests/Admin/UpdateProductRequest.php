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

    public function prepareForValidation()
    {
        if ($this->has('variants') && is_string($this->variants)) {
            $decoded = json_decode($this->variants, true);
            if (is_array($decoded)) {
                $this->merge(['variants_array' => $decoded]);
            }
        }
    }

    public function rules(): array
    {
        return [
            'brand_id'           => ['nullable', 'exists:brands,id'],
            'category_id'        => ['nullable', 'exists:categories,id'],
            'product_type_id'    => ['nullable', 'exists:product_types,id'],
            'name'               => ['sometimes', 'string', 'max:200'],
            'subtitle'           => ['nullable', 'string', 'max:300'],
            'description'        => ['nullable', 'string'],
            'ingredients'        => ['nullable', 'string'],
            'gender'             => ['sometimes', Rule::in(['men', 'women', 'unisex', 'Men', 'Women', 'Unisex'])],
            'price'              => ['sometimes', 'numeric', 'min:0'],
            'original_price'     => ['nullable', 'numeric', 'min:0'],
            'stock'              => ['sometimes', 'integer', 'min:0'],
            'is_active'          => ['nullable', 'boolean'],
            'is_featured'        => ['nullable', 'boolean'],
            'is_best_seller'     => ['nullable', 'boolean'],
            'is_gift'            => ['nullable', 'boolean'],
            'is_recommended'     => ['nullable', 'boolean'],
            'variants'           => ['nullable', 'string'],
            'variants_array'                       => ['nullable', 'array', 'max:3'],
            'variants_array.*.size'                => ['required', 'numeric', 'min:1', 'distinct'],
            'variants_array.*.price'               => ['required', 'numeric', 'min:0'],
            'variants_array.*.promotion_percent'   => ['nullable', 'numeric', 'min:0', 'max:100'],
            'variants_array.*.promotion'           => ['nullable', 'numeric', 'min:0', 'max:100'],
            'variants_array.*.stock'               => ['nullable', 'integer', 'min:0'],
            'faqs'               => ['nullable', 'string'],
            'reviews_array'      => ['nullable', 'string'],
            'deleted_review_ids' => ['nullable', 'string'],
            'manual_ingredients' => ['nullable', 'string'],
            'deleted_image_ids'  => ['nullable', 'string'],
            'images.*'           => ['nullable', 'image', 'max:10240'],
        ];
    }
}
