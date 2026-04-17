<?php

namespace Database\Seeders;

use App\Models\HeroVideo;
use Illuminate\Database\Seeder;

/**
 * Registers the 6 existing frontend /public videos into the hero_videos DB table.
 *
 * These are marked is_legacy=true so the backend returns their path as-is,
 * and the browser resolves them relative to the Next.js frontend origin.
 *
 * Run: php artisan db:seed --class=HeroVideoSeeder
 * Safe to re-run: skips if videos already exist.
 */
class HeroVideoSeeder extends Seeder
{
    public function run(): void
    {
        if (HeroVideo::count() > 0) {
            $this->command->info('HeroVideoSeeder: videos already registered, skipping.');
            return;
        }

        $legacy = [
            // Desktop — ordered by filename
            ['path' => '/Home background/Desktop1.mp4', 'type' => 'desktop', 'display_order' => 1],
            ['path' => '/Home background/Desktop2.mp4', 'type' => 'desktop', 'display_order' => 2],
            ['path' => '/Home background/Desktop3.mp4', 'type' => 'desktop', 'display_order' => 3],
            // Mobile
            ['path' => '/Home background/Mobile1.mp4',  'type' => 'mobile',  'display_order' => 1],
            ['path' => '/Home background/Mobile2.mp4',  'type' => 'mobile',  'display_order' => 2],
            ['path' => '/Home background/Mobile3.mp4',  'type' => 'mobile',  'display_order' => 3],
        ];

        foreach ($legacy as $row) {
            HeroVideo::create([
                'path'          => $row['path'],
                'type'          => $row['type'],
                'display_order' => $row['display_order'],
                'is_active'     => true,
                'is_legacy'     => true,
            ]);
        }

        $this->command->info('HeroVideoSeeder: 6 legacy videos registered.');
    }
}
