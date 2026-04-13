<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Ingredient extends Model
{
    protected $fillable = ['name', 'image_url'];

    public function products(): BelongsToMany
    {
        return $this->belongsToMany(Product::class);
    }

    /**
     * Get the full image URL with app domain prepended
     */
    public function getImageUrlAttribute(?string $value): ?string
    {
        if (!$value) return null;

        // Clean URL
        $value = str_replace(["\r\n", "\r", "\n"], ' ', $value);
        $value = trim($value);

        if (str_starts_with($value, 'https://')) return $value;

        if (str_starts_with($value, 'http://')) {
            $path = parse_url($value, PHP_URL_PATH) ?? '';
            return rtrim(config('app.url'), '/') . $path;
        }

        if (str_starts_with($value, '/storage/')) {
            return rtrim(config('app.url'), '/') . $value;
        }

        return $value;
    }
}
