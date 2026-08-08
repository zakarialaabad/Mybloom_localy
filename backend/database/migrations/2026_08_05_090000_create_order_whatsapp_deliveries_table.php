<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('order_whatsapp_deliveries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('purpose', 50)->default('order_confirmation');
            $table->string('recipient_original', 50);
            $table->string('recipient_e164', 20);
            $table->string('canonical_chat_id', 191)->nullable();
            $table->timestamp('consent_at')->nullable();
            $table->string('status', 30)->default('queued');
            $table->string('message_id', 191)->nullable();
            $table->string('fallback_message_id', 191)->nullable();
            $table->timestamp('auto_attempted_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('fallback_available_at')->nullable();
            $table->text('fallback_token_hash');
            // Nullable for compatibility with older MySQL versions that
            // otherwise assign an invalid implicit zero timestamp. Creation
            // always supplies this value in OrderService.
            $table->timestamp('fallback_expires_at')->nullable();
            $table->timestamp('fallback_used_at')->nullable();
            $table->timestamp('customer_initiated_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->unsignedSmallInteger('attempt_count')->default(0);
            $table->string('last_error_code', 100)->nullable();
            $table->string('last_error_message', 500)->nullable();
            $table->text('invoice_url')->nullable();
            $table->timestamp('invoice_expires_at')->nullable();
            $table->timestamps();

            $table->unique(['order_id', 'purpose'], 'order_whatsapp_delivery_once');
            $table->unique('message_id', 'order_whatsapp_delivery_message_unique');
            $table->unique('fallback_message_id', 'order_whatsapp_delivery_fallback_message_unique');
            $table->index(['status', 'fallback_available_at']);
        });

        Schema::create('openwa_webhook_events', function (Blueprint $table) {
            $table->id();
            $table->string('event_key', 191)->unique();
            $table->string('event_type', 50);
            $table->string('session_id', 100)->nullable();
            $table->text('payload');
            $table->timestamp('processed_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('openwa_webhook_events');
        Schema::dropIfExists('order_whatsapp_deliveries');
    }
};
