<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('hero_videos', function (Blueprint $table) {
            // Path to the FFmpeg-compressed version (H.264, CRF 28, faststart).
            // NULL means the file has not been processed yet.
            $table->string('compressed_path', 500)->nullable()->after('path');

            // Path to the auto-generated JPEG thumbnail (first frame at 1s).
            // Used as <video poster> for instant visual on slow connections.
            $table->string('thumbnail_path', 500)->nullable()->after('compressed_path');

            // Timestamp when compression completed. NULL = pending or unavailable.
            $table->timestamp('compressed_at')->nullable()->after('thumbnail_path');
        });
    }

    public function down(): void
    {
        Schema::table('hero_videos', function (Blueprint $table) {
            $table->dropColumn(['compressed_path', 'thumbnail_path', 'compressed_at']);
        });
    }
};
