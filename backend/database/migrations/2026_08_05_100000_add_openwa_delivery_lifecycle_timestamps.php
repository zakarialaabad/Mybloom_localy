<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_whatsapp_deliveries', function (Blueprint $table): void {
            // The create migration includes these for fresh installations.
            // These guards upgrade local databases that ran an earlier draft.
            if (! Schema::hasColumn('order_whatsapp_deliveries', 'customer_initiated_at')) {
                $table->timestamp('customer_initiated_at')->nullable()->after('fallback_used_at');
            }
            if (! Schema::hasColumn('order_whatsapp_deliveries', 'failed_at')) {
                $table->timestamp('failed_at')->nullable()->after('customer_initiated_at');
            }
        });
    }

    public function down(): void
    {
        Schema::table('order_whatsapp_deliveries', function (Blueprint $table): void {
            $columns = array_filter(['customer_initiated_at', 'failed_at'], fn (string $column) => Schema::hasColumn('order_whatsapp_deliveries', $column));
            if ($columns !== []) {
                $table->dropColumn($columns);
            }
        });
    }
};
