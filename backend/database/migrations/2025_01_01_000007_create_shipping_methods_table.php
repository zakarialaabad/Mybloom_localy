<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_methods', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('description', 300)->nullable();
            $table->decimal('price', 10, 2)->default(0.00);
            $table->decimal('free_over', 12, 2)->nullable();   // order total threshold for free shipping
            $table->boolean('is_active')->default(true);
            $table->unsignedSmallInteger('sort_order')->default(0);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_methods');
    }
};
