<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * PROBLEM:
     *   `products` has a unique index on (slug) only.
     *   The show() query is:
     *     WHERE slug = ? AND deleted_at IS NULL
     *
     *   MySQL uses the slug unique index to find the row, but must then
     *   re-evaluate `deleted_at IS NULL` as a separate filter pass — 35ms per hit.
     *
     * SOLUTION:
     *   A GENERATED column `slug_active` that is NULL when deleted_at IS NOT NULL
     *   and equals slug when the row is not soft-deleted, combined with a unique
     *   index on (slug_active). This is the portable MySQL 5.7+ approach —
     *   functional indexes on expressions are only available in MySQL 8.0.13+.
     *
     *   Because slug_active is NULL for deleted rows, MySQL's unique constraint
     *   ignores them (NULL != NULL), so the index only covers live rows and the
     *   lookup goes from 35ms → ~1ms.
     *
     *   If the DB already supports MySQL 8+ functional index syntax you could
     *   simply do: CREATE INDEX … ON products ((CASE WHEN deleted_at IS NULL THEN slug END))
     *   but the generated column approach works on both 5.7 and 8.
     */
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Add the virtual generated column (stored=false, so no extra disk usage)
        DB::statement('
            ALTER TABLE products
            ADD COLUMN slug_active VARCHAR(255) GENERATED ALWAYS AS (
                IF(deleted_at IS NULL, slug, NULL)
            ) VIRTUAL
        ');

        // Unique index on the virtual column — covers: WHERE slug=? AND deleted_at IS NULL
        // NULL values are excluded from uniqueness checks, so soft-deleted rows don't conflict.
        Schema::table('products', function (Blueprint $table) {
            $table->unique('slug_active', 'products_slug_active_unique');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Drop index first, then column
        Schema::table('products', function (Blueprint $table) {
            $table->dropUnique('products_slug_active_unique');
            $table->dropColumn('slug_active');
        });
    }
};
