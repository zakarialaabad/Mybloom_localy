<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_method', 40)->default('cash_on_delivery')->after('status');
            $table->string('payment_status', 40)->default('pending')->after('payment_method');
            $table->timestamp('whatsapp_consent_at')->nullable()->after('whatsapp_confirmation_requested');
            $table->string('whatsapp_consent_source', 40)->nullable()->after('whatsapp_consent_at');
        });

        Schema::create('order_whatsapp_notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('channel', 20);
            $table->string('message_type', 50);
            $table->string('provider', 30);
            $table->string('recipient_e164', 20);
            $table->string('status', 30)->default('pending');
            $table->string('provider_message_id', 191)->nullable();
            $table->unsignedSmallInteger('attempt_count')->default(0);
            $table->timestamp('accepted_at')->nullable();
            $table->timestamp('delivered_at')->nullable();
            $table->timestamp('failed_at')->nullable();
            $table->timestamp('invoice_link_created_at')->nullable();
            $table->timestamp('invoice_link_expires_at')->nullable();
            $table->string('last_error_code', 100)->nullable();
            $table->string('last_error_message', 500)->nullable();
            $table->timestamps();

            $table->unique(['order_id', 'channel', 'message_type'], 'order_whatsapp_notification_once');
            $table->unique(['provider', 'provider_message_id'], 'order_whatsapp_provider_message_unique');
            $table->index(['status', 'provider'], 'order_whatsapp_notification_status_provider');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('order_whatsapp_notifications');

        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'payment_method',
                'payment_status',
                'whatsapp_consent_at',
                'whatsapp_consent_source',
            ]);
        });
    }
};
