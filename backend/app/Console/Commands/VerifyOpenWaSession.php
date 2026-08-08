<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\OpenWa\OpenWaClient;
use App\Services\OpenWa\OpenWaException;
use Illuminate\Console\Command;

class VerifyOpenWaSession extends Command
{
    protected $signature = 'openwa:verify-session';

    protected $description = 'Verify the OpenWA session is ready and authenticated as the configured owner number';

    public function handle(OpenWaClient $openwa): int
    {
        try {
            $openwa->assertReadyForOwner();
            $this->info('OpenWA session is ready and authenticated as the configured owner.');

            return self::SUCCESS;
        } catch (OpenWaException $e) {
            $this->error('OpenWA verification failed: '.$e->errorCode);

            return self::FAILURE;
        }
    }
}
