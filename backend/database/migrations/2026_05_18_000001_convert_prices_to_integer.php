<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Convert products table prices to integers
        Schema::table('products', function (Blueprint $table) {
            // Use raw SQL to round decimal values before converting to integer
            DB::statement('ALTER TABLE products MODIFY COLUMN price INTEGER DEFAULT 0');
            DB::statement('ALTER TABLE products MODIFY COLUMN original_price INTEGER NULL');
        });

        // Convert product_variants table price to integer
        Schema::table('product_variants', function (Blueprint $table) {
            DB::statement('ALTER TABLE product_variants MODIFY COLUMN price INTEGER DEFAULT 0');
        });

        // Convert product_sizes table price_modifier to integer
        Schema::table('product_sizes', function (Blueprint $table) {
            DB::statement('ALTER TABLE product_sizes MODIFY COLUMN price_modifier INTEGER DEFAULT 0');
        });
    }

    public function down(): void
    {
        if (DB::getDriverName() !== 'mysql') {
            return;
        }

        // Revert back to decimal(12,2) if needed
        Schema::table('products', function (Blueprint $table) {
            DB::statement('ALTER TABLE products MODIFY COLUMN price DECIMAL(12, 2)');
            DB::statement('ALTER TABLE products MODIFY COLUMN original_price DECIMAL(12, 2) NULL');
        });

        Schema::table('product_variants', function (Blueprint $table) {
            DB::statement('ALTER TABLE product_variants MODIFY COLUMN price DECIMAL(10, 2)');
        });

        Schema::table('product_sizes', function (Blueprint $table) {
            DB::statement('ALTER TABLE product_sizes MODIFY COLUMN price_modifier DECIMAL(10, 2)');
        });
    }
};
