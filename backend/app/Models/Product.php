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
        return $this->hasMany(Review::class)->where('is_approved', true);
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
}
