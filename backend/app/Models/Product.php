<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class Product extends Model
{
    use HasFactory;
    use SoftDeletes;

    protected $fillable = [
        'brand_id',
        'category_id',
        'product_type_id',
        'name',
        'slug',
        'subtitle',
        'description',
        'ingredients',
        'gender',
        'price',
        'original_price',
        'stock',
        'is_active',
        'is_featured',
        'is_best_seller',
        'is_gift',
        'is_recommended',
    ];

    protected function casts(): array
    {
        return [
            'price'          => 'decimal:2',
            'original_price' => 'decimal:2',
            'stock'          => 'integer',
            'is_active'      => 'boolean',
            'is_featured'    => 'boolean',
            'is_best_seller' => 'boolean',
            'is_gift'        => 'boolean',
            'is_recommended' => 'boolean',
        ];
    }

    // ── Auto-generate slug on create ─────────────────────────────────────────

    protected static function booted(): void
    {
        static::creating(function (Product $product) {
            if (empty($product->slug)) {
                $product->slug = Str::slug($product->name) . '-' . strtolower(Str::random(6));
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function brand(): BelongsTo
    {
        return $this->belongsTo(Brand::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function productType(): BelongsTo
    {
        return $this->belongsTo(ProductType::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('sort_order');
    }

    public function variants(): HasMany
    {
        return $this->hasMany(ProductVariant::class);
    }

    public function sizes(): HasMany
    {
        return $this->hasMany(ProductSize::class);
    }

    public function reviews(): HasMany
    {
        // Public-facing reviews: approved, positive (>=3★), and feedback (no order_number)
        // These are the reviews shown on product pages; order-related reviews
        // are counted in aggregates but not displayed here.
        return $this->hasMany(Review::class)
            ->where('is_approved', true)
            ->where('rating', '>=', 3)
            ->whereNull('order_number');
    }

    /**
     * All approved positive reviews — used for aggregates (counts / averages).
     * Includes feedback reviews (order_number IS NULL) so counts reflect them,
     * but these feedback reviews are not shown in product review lists.
     */
    public function approvedReviews(): HasMany
    {
        return $this->hasMany(Review::class)
            ->where('is_approved', true)
            ->where('rating', '>=', 3);
    }

    /**
     * Feedback reviews only (approved, positive, no order_number).
     * Kept for clarity and possible future use.
     */
    public function feedbackReviews(): HasMany
    {
        return $this->hasMany(Review::class)
            ->where('is_approved', true)
            ->where('rating', '>=', 3)
            ->whereNull('order_number');
    }

    public function ingredientItems(): BelongsToMany
    {
        return $this->belongsToMany(Ingredient::class, 'ingredient_product');
    }

    public function allReviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function faqs(): HasMany
    {
        return $this->hasMany(ProductFaq::class);
    }

    // ── Getters/Attributes ──────────────────────────────────────────────────

    /**
     * Get the primary image URL for the product.
     * Logic matches ProductResource: first primary image, or just the first image.
     */
    public function getImageUrlAttribute(): ?string
    {
        $image = $this->images->firstWhere('is_primary', true) ?? $this->images->first();
        if (!$image) return null;

        $url = $image->url;
        if (!$url) return null;

        // Clean URL
        $url = str_replace(["\r\n", "\r", "\n"], ' ', $url);
        $url = trim($url);

        if (str_starts_with($url, 'https://')) return $url;
        
        if (str_starts_with($url, 'http://')) {
            $path = parse_url($url, PHP_URL_PATH) ?? '';
            return rtrim(config('app.url'), '/') . $path;
        }

        if (str_starts_with($url, '/storage/')) {
            return rtrim(config('app.url'), '/') . $url;
        }

        return $url;
    }

    // ── Get recommended products ────────────────────────────────────────────────
    /**
     * Get all recommended products (products with is_recommended = true)
     * Used by API to return in product detail response
     */
    public function scopeRecommended($query)
    {
        return $query->where('is_recommended', true)
                     ->where('is_active', true);
    }
}
