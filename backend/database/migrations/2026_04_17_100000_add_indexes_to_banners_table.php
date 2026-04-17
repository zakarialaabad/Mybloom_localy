<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            // Composite index for homepage_slot queries: WHERE type='homepage_slot' AND is_active=1 ORDER BY position
            $table->index(['type', 'is_active', 'position'], 'banners_type_active_position_idx');

            // Composite index for collection_hero queries: WHERE type='collection_hero' AND is_active=1 AND collection_id=?
            $table->index(['type', 'is_active', 'collection_id'], 'banners_type_active_collection_idx');
        });
    }

    public function down(): void
    {
        Schema::table('banners', function (Blueprint $table) {
            $table->dropIndex('banners_type_active_position_idx');
            $table->dropIndex('banners_type_active_collection_idx');
        });
    }
};
