<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\Process;

class LoadArabicFonts extends Command
{
    protected $signature = 'fonts:load-arabic';

    protected $description = 'Load DejaVu Sans fonts (Arabic-compatible) into DomPDF font directory';

    public function handle(): int
    {
        $this->info('🔤 Loading Arabic-compatible fonts for DomPDF...');

        $fontDir = storage_path('fonts');

        // Ensure font directory exists
        if (!is_dir($fontDir)) {
            mkdir($fontDir, 0755, true);
            $this->info("✓ Created font directory: {$fontDir}");
        }

        // DejaVu Sans is included in most Linux systems and supports Arabic
        // We'll try to copy from system, or provide instructions for download
        $systemFontPaths = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf',
            '/System/Library/Fonts/DejaVuSans.ttf',  // macOS
            'C:\\Windows\\Fonts\\DejaVuSans.ttf',    // Windows
        ];

        $found = false;
        foreach ($systemFontPaths as $path) {
            if (file_exists($path)) {
                copy($path, $fontDir . '/DejaVuSans.ttf');
                copy(str_replace('DejaVuSans', 'DejaVuSans-Bold', $path), $fontDir . '/DejaVuSans-Bold.ttf');
                $this->info("✓ Copied DejaVu Sans from system fonts");
                $found = true;
                break;
            }
        }

        if (!$found) {
            $this->warn('⚠ DejaVu fonts not found in system paths. Downloading from Google Fonts...');
            $this->downloadGoogleFont();
        }

        // Register fonts with DomPDF using the artisan command
        $this->info('📝 Registering fonts with DomPDF...');
        $this->call('vendor:publish', ['--provider' => 'Barryvdh\\DomPDF\\ServiceProvider']);

        $this->info('✅ Arabic fonts loaded successfully!');
        $this->info('Use font-family: DejaVuSans in your CSS for Arabic text.');

        return self::SUCCESS;
    }

    private function downloadGoogleFont(): void
    {
        // Cairo font is optimized for Arabic
        $url = 'https://github.com/google/fonts/raw/main/ofl/cairo/Cairo%5Bwght%5D.ttf';
        $fontPath = storage_path('fonts/Cairo.ttf');

        try {
            $this->info("Downloading Cairo font...");
            Process::run("wget -O {$fontPath} {$url}")->throw();
            $this->info("✓ Cairo font downloaded");
        } catch (\Exception $e) {
            $this->error("Could not auto-download. Install manually:");
            $this->error("1. Download from: https://github.com/google/fonts/blob/main/ofl/cairo/");
            $this->error("2. Extract to: {$this->laravel->storagePath()}/fonts/");
        }
    }
}
