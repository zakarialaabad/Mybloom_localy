<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // WhatsApp opt-in feature has been removed.
        // This migration is now a no-op to preserve migration history.
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // WhatsApp opt-in feature has been removed.
    }
};
