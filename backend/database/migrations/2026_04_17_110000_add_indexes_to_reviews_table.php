<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            // Homepage query: WHERE is_approved=1 AND order_number IS NULL ORDER BY rating DESC, created_at DESC
            // Existing index (product_id, is_approved) is useless here — product_id is not in the WHERE clause.
            // This index covers the filter and allows MySQL to avoid a filesort for ORDER BY.
            $table->index(
                ['is_approved', 'order_number', 'rating', 'created_at'],
                'reviews_homepage_idx'
            );

            // Product detail page query: WHERE product_id=? AND is_approved=1 ORDER BY rating DESC, created_at DESC
            // Extends the existing (product_id, is_approved) index with sort columns.
            $table->index(
                ['product_id', 'is_approved', 'rating', 'created_at'],
                'reviews_product_approved_sort_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropIndex('reviews_homepage_idx');
            $table->dropIndex('reviews_product_approved_sort_idx');
        });
    }
};
