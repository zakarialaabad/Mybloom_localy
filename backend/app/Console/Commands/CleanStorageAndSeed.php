<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class CleanStorageAndSeed extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:clean-storage-and-seed {--fresh : Run migrations fresh before seeding}';

    /**
     * The description of the console command.
     *
     * @var string
     */
    protected $description = 'Clean storage directories and reseed database with fresh data';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $this->info('🧹 Cleaning storage directories...');

        // Clean storage/app directory (uploaded files, cache, etc.)
        $appStoragePath = storage_path('app');
        if (File::isDirectory($appStoragePath)) {
            File::deleteDirectory($appStoragePath);
            File::makeDirectory($appStoragePath);
            $this->info('✅ Cleaned storage/app');
        }

        // Clean storage/framework/cache
        $cachePath = storage_path('framework/cache');
        if (File::isDirectory($cachePath)) {
            File::deleteDirectory($cachePath);
            File::makeDirectory($cachePath);
            $this->info('✅ Cleaned storage/framework/cache');
        }

        // Optionally clean storage/logs
        $logsPath = storage_path('logs');
        if (File::isDirectory($logsPath)) {
            // Remove old log files but keep the directory
            foreach (File::files($logsPath) as $file) {
                File::delete($file);
            }
            $this->info('✅ Cleaned storage/logs');
        }

        // Run migrations:fresh if --fresh flag is set
        if ($this->option('fresh')) {
            $this->info('🔄 Running migrations:fresh...');
            $this->call('migrate:fresh', ['--force' => true]);
            $this->info('✅ Migrations completed');
        }

        // Run all seeders
        $this->info('🌱 Seeding database...');
        $this->call('db:seed', [
            '--class' => 'Database\\Seeders\\AppSeeder',
            '--force' => true
        ]);
        $this->info('✅ Seeding completed');

        $this->info('🎉 All done! Storage cleaned and database reseeded.');
        return self::SUCCESS;
    }
}
