<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 20)->unique();
            $table->foreignId('coupon_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('shipping_method_id')->nullable()->constrained()->nullOnDelete();

            // Customer info (anonymous — no auth required)
            $table->string('customer_name', 150);
            $table->string('customer_phone', 20);
            $table->string('customer_email', 200)->nullable();

            // Shipping address
            $table->string('shipping_address', 300);
            $table->string('shipping_city', 100);
            $table->string('shipping_province', 100)->nullable();
            $table->string('shipping_postal_code', 20)->nullable();

            // Financials
            $table->decimal('subtotal', 12, 2);
            $table->decimal('discount_amount', 12, 2)->default(0.00);
            $table->decimal('shipping_cost', 10, 2)->default(0.00);
            $table->decimal('total', 12, 2);

            // Status
            $table->string('status', 50)->default('pending');

            // Notes
            $table->text('notes')->nullable();
            $table->text('admin_notes')->nullable();

            $table->timestamps();

            $table->index('status');
            $table->index('customer_phone');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
