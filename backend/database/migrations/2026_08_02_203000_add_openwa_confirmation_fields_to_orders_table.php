<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->boolean('whatsapp_confirmation_requested')->default(false)->after('admin_notes');
            $table->string('whatsapp_confirmation_status', 20)->default('pending')->after('whatsapp_confirmation_requested');
            $table->string('whatsapp_confirmation_message_id', 191)->nullable()->after('whatsapp_confirmation_status');
            $table->timestamp('whatsapp_confirmation_sent_at')->nullable()->after('whatsapp_confirmation_message_id');
            $table->timestamp('whatsapp_confirmation_failed_at')->nullable()->after('whatsapp_confirmation_sent_at');
            $table->text('whatsapp_confirmation_error')->nullable()->after('whatsapp_confirmation_failed_at');

            $table->index(
                ['whatsapp_confirmation_requested', 'whatsapp_confirmation_status'],
                'orders_whatsapp_confirmation_idx'
            );
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex('orders_whatsapp_confirmation_idx');
            $table->dropColumn([
                'whatsapp_confirmation_requested',
                'whatsapp_confirmation_status',
                'whatsapp_confirmation_message_id',
                'whatsapp_confirmation_sent_at',
                'whatsapp_confirmation_failed_at',
                'whatsapp_confirmation_error',
            ]);
        });
    }
};
