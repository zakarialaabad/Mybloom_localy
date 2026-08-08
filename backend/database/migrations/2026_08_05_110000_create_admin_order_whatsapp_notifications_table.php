<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('admin_order_whatsapp_notifications', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('recipient_e164', 20)->default('212611955060');
            $table->string('canonical_chat_id', 191)->nullable();
            $table->string('status', 30)->default('queued');
            $table->string('message_id', 191)->nullable();
            $table->timestamp('attempted_at')->nullable();
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->unsignedSmallInteger('attempt_count')->default(0);
            $table->string('last_error_code', 100)->nullable();
            $table->string('last_error_message', 500)->nullable();
            $table->timestamps();

            // One record is both the audit trail and the durable idempotency
            // key for this internal notification. It is intentionally not a
            // customer WhatsApp delivery record.
            $table->unique('order_id', 'admin_order_whatsapp_notification_once');
            $table->unique('message_id', 'admin_order_whatsapp_message_unique');
            $table->index(['status', 'attempted_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('admin_order_whatsapp_notifications');
    }
};
