<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreReviewRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Public endpoint
    }

    public function rules(): array
    {
        return [
            'product_id'    => ['required', 'exists:products,id'],
            'order_number'  => ['nullable', 'string', 'max:20'],
            'reviewer_name' => ['required', 'string', 'max:100'],
            'rating'        => ['required', 'integer', 'min:1', 'max:5'],
            'body'          => ['nullable', 'string', 'max:2000'],
        ];
    }
}
