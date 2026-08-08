<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->string('product_name', 200)->nullable()->after('product_id');
        });

        DB::table('order_items')
            ->leftJoin('products', 'order_items.product_id', '=', 'products.id')
            ->select('order_items.id', 'products.name')
            ->whereNull('order_items.product_name')
            ->orderBy('order_items.id')
            ->chunk(500, function ($items): void {
                foreach ($items as $item) {
                    if ($item->name === null) {
                        continue;
                    }

                    DB::table('order_items')
                        ->where('id', $item->id)
                        ->update(['product_name' => $item->name]);
                }
            });
    }

    public function down(): void
    {
        Schema::table('order_items', function (Blueprint $table) {
            $table->dropColumn('product_name');
        });
    }
};
