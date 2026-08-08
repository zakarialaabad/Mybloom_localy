<?php

declare(strict_types=1);

namespace App\Console\Commands;

use App\Services\OpenWa\OpenWaClient;
use App\Services\OpenWa\OpenWaException;
use Illuminate\Console\Command;

class ConfigureOpenWaWebhook extends Command
{
    protected $signature = 'openwa:configure-webhook';

    protected $description = 'Register MyBloom signed OpenWA delivery and inbound-message webhooks';

    public function handle(OpenWaClient $openwa): int
    {
        $url = (string) config('services.openwa.webhook_url');
        $localDockerUrl = app()->environment('local') && str_starts_with($url, 'http://host.docker.internal:');
        if (! filter_var($url, FILTER_VALIDATE_URL) || (! str_starts_with($url, 'https://') && ! $localDockerUrl)) {
            $this->error('OPENWA_WEBHOOK_URL must be public HTTPS, or host.docker.internal for local Docker OpenWA.');

            return self::FAILURE;
        }
        try {
            $openwa->assertReadyForOwner();
            $openwa->registerWebhook($url, ['message.ack', 'message.received', 'message.failed', 'session.disconnected', 'session.status']);
            $this->info('OpenWA webhook registered.');

            return self::SUCCESS;
        } catch (OpenWaException $e) {
            $this->error('OpenWA webhook registration failed: '.$e->errorCode);

            return self::FAILURE;
        }
    }
}
