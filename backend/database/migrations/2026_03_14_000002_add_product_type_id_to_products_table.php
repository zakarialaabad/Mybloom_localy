<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('product_type_id')
                  ->nullable()
                  ->after('category_id')
                  ->constrained('product_types')
                  ->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeignIdFor(\App\Models\ProductType::class);
            $table->dropColumn('product_type_id');
        });
    }
};
