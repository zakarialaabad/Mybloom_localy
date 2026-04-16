<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Performance indexes to eliminate "Using filesort" on the default product list query.
     *
     * PROBLEM: EXPLAIN shows the main query does a full table scan + filesort:
     *   SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC
     *   → type=ALL, Extra="Using where; Using filesort"
     *
     * SOLUTION: Composite index on (is_active, created_at) so MySQL can:
     *   1. Use the index to filter is_active = 1 instantly
     *   2. Return rows already ordered by created_at (no in-memory sort required)
     *
     * Additional: (is_active, price) for price_asc / price_desc sort paths.
     * Additional: (is_active, is_recommended) for the recommendations carousel query.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Covers: WHERE is_active=1 ORDER BY created_at DESC  (default "newest" sort)
            $table->index(['is_active', 'created_at'], 'products_active_created_at_index');

            // Covers: WHERE is_active=1 ORDER BY price ASC/DESC
            $table->index(['is_active', 'price'], 'products_active_price_index');

            // Covers: WHERE is_active=1 AND is_recommended=1  (recommendations carousel)
            $table->index(['is_active', 'is_recommended'], 'products_active_recommended_index');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex('products_active_created_at_index');
            $table->dropIndex('products_active_price_index');
            $table->dropIndex('products_active_recommended_index');
        });
    }
};
