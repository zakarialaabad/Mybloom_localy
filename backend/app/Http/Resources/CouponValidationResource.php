<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CouponValidationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'code'             => $this->code,
            'type'             => $this->type,
            'value'            => (float) $this->value,
            'min_order_amount' => (float) $this->min_order_amount,
            'expires_at'       => $this->expires_at?->toISOString(),
        ];
    }
}
