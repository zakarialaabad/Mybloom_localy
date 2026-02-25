<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_sizes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->cascadeOnDelete();
            $table->string('label', 50);              // e.g. "30ml", "50ml", "100ml"
            $table->decimal('price_modifier', 10, 2)->default(0.00);
            $table->unsignedInteger('stock')->default(0);

            $table->unique(['product_id', 'label']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_sizes');
    }
};
