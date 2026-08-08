<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('whatsapp_invoice_status', 20)->default('pending')->after('whatsapp_confirmation_error');
            $table->string('whatsapp_invoice_message_id', 191)->nullable()->after('whatsapp_invoice_status');
            $table->timestamp('whatsapp_invoice_sent_at')->nullable()->after('whatsapp_invoice_message_id');
            $table->timestamp('whatsapp_invoice_failed_at')->nullable()->after('whatsapp_invoice_sent_at');
            $table->text('whatsapp_invoice_error')->nullable()->after('whatsapp_invoice_failed_at');

            $table->index('whatsapp_invoice_status', 'orders_whatsapp_invoice_status_idx');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_whatsapp_invoice_status_idx');
            $table->dropColumn([
                'whatsapp_invoice_status',
                'whatsapp_invoice_message_id',
                'whatsapp_invoice_sent_at',
                'whatsapp_invoice_failed_at',
                'whatsapp_invoice_error',
            ]);
        });
    }
};
