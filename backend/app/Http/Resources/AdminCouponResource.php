<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AdminCouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'               => $this->id,
            'code'             => $this->code,
            'company_name'     => $this->company_name,
            'promo_type'       => $this->promo_type,
            'type'             => $this->type,
            'value'            => (float) $this->value,
            'min_order_amount' => (float) $this->min_order_amount,
            'usage_limit'      => $this->usage_limit,
            'used_count'       => (int) $this->used_count,
            'expires_at'       => $this->expires_at?->toISOString(),
            'is_active'        => (bool) $this->is_active,
            'is_expired'       => $this->isExpired(),
            'is_exhausted'     => $this->isExhausted(),
            'is_usable'        => $this->isUsable(),
            'created_at'       => $this->created_at->toISOString(),
        ];
    }
}
