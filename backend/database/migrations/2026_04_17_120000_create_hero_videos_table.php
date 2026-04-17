<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('hero_videos', function (Blueprint $table) {
            $table->id();

            // For legacy videos: "/Home background/Desktop1.mp4" (served by Next.js /public)
            // For new uploads:   "videos/hero_desktop_abc123.mp4"  (served by Laravel /storage)
            $table->string('path', 500);

            $table->enum('type', ['desktop', 'mobile']);
            $table->unsignedTinyInteger('display_order')->default(1);
            $table->boolean('is_active')->default(true);

            // true  = path is a legacy frontend /public path
            // false = path is a Laravel storage/public relative path
            $table->boolean('is_legacy')->default(false);

            $table->timestamps();

            // Index used by the public API: WHERE type=? AND is_active=1 ORDER BY display_order
            $table->index(['type', 'is_active', 'display_order'], 'hero_videos_type_active_order_idx');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('hero_videos');
    }
};
