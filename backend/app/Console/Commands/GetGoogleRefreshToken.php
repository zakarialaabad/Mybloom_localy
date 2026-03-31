<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use GuzzleHttp\Client;

class GetGoogleRefreshToken extends Command
{
    protected $signature   = 'google:get-token';
    protected $description = 'Get a Google OAuth2 refresh token for the Gmail API';

    public function handle(): void
    {
        $clientId     = config('services.google.client_id');
        $clientSecret = config('services.google.client_secret');
        // Use port 9090 — nothing runs there, so Google's redirect is captured cleanly
        $redirectUri  = 'http://localhost:9090';
        $scope        = 'https://www.googleapis.com/auth/gmail.send';

        if (empty($clientId) || empty($clientSecret)) {
            $this->error('GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET is missing in .env');
            return;
        }

        // Step 1: Build authorization URL
        $authUrl = 'https://accounts.google.com/o/oauth2/auth?' . http_build_query([
            'client_id'     => $clientId,
            'redirect_uri'  => $redirectUri,
            'response_type' => 'code',
            'scope'         => $scope,
            'access_type'   => 'offline',
            'prompt'        => 'consent',
        ]);

        // Step 2: Write a tiny PHP script that captures the OAuth code
        $catcherPath = sys_get_temp_dir() . '/oauth_catcher.php';
        $tokenFile   = sys_get_temp_dir() . '/oauth_code.txt';

        // Remove old token file if it exists
        if (file_exists($tokenFile)) {
            unlink($tokenFile);
        }

        file_put_contents($catcherPath, <<<'PHP'
<?php
$code = $_GET['code'] ?? null;
if ($code) {
    file_put_contents(sys_get_temp_dir() . '/oauth_code.txt', $code);
    echo "<h2 style='font-family:sans-serif;color:green;text-align:center;margin-top:100px'>
        ✅ Authorization successful!<br><small>You can close this tab and return to the terminal.</small>
    </h2>";
} else {
    echo "<h2 style='color:red;font-family:sans-serif;text-align:center;margin-top:100px'>
        ❌ No code received. Error: " . htmlspecialchars($_GET['error'] ?? 'unknown') . "
    </h2>";
}
PHP);

        // Step 3: Start built-in PHP server on port 9090 in background
        $serverProcess = proc_open(
            PHP_BINARY . ' -S localhost:9090 ' . $catcherPath,
            [['pipe', 'r'], ['pipe', 'w'], ['pipe', 'w']],
            $pipes
        );

        if (!is_resource($serverProcess)) {
            $this->error('Could not start local server on port 9090. Is the port in use?');
            return;
        }

        $this->newLine();
        $this->line('<fg=cyan>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</>');
        $this->line('<fg=green> ✓ Listener started on http://localhost:9090 — waiting for Google...</>');
        $this->line('<fg=cyan>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</>');
        $this->newLine();
        $this->line('<fg=yellow> STEP 1: Open this URL in your browser:</>');
        $this->newLine();
        $this->line($authUrl);
        $this->newLine();
        $this->line('<fg=yellow> STEP 2: Sign in with zakarialaalbad200@gmail.com and click Allow</>');
        $this->line('<fg=yellow> STEP 3: Browser will show "✅ Authorization successful!"</>');
        $this->line('<fg=yellow> STEP 4: Return here — token will be saved automatically!</>');
        $this->line('<fg=cyan>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</>');
        $this->newLine();

        // Step 4: Wait for the code file to appear (poll every second, 3 minutes max)
        $waitSeconds = 0;
        $maxWait     = 180;
        $parsedCode  = null;

        $this->output->write('<fg=cyan>Waiting for authorization</> ');
        while ($waitSeconds < $maxWait) {
            if (file_exists($tokenFile)) {
                $parsedCode = trim(file_get_contents($tokenFile));
                unlink($tokenFile);
                break;
            }
            sleep(1);
            $waitSeconds++;
            if ($waitSeconds % 5 === 0) {
                $this->output->write('.');
            }
        }

        // Stop the server
        proc_terminate($serverProcess);
        proc_close($serverProcess);
        @unlink($catcherPath);

        $this->newLine();

        if (empty($parsedCode)) {
            $this->error('Timed out waiting for authorization. Please try again.');
            return;
        }

        $this->info('✓ Code captured! Exchanging for refresh token...');

        // Step 5: Exchange code for tokens
        try {
            $http     = new Client(['timeout' => 15]);
            $response = $http->post('https://oauth2.googleapis.com/token', [
                'form_params' => [
                    'code'          => $parsedCode,
                    'client_id'     => $clientId,
                    'client_secret' => $clientSecret,
                    'redirect_uri'  => $redirectUri,
                    'grant_type'    => 'authorization_code',
                ],
            ]);

            $data = json_decode((string) $response->getBody(), true);

            if (empty($data['refresh_token'])) {
                $this->error('No refresh_token in response: ' . json_encode($data));
                $this->warn('Tip: Make sure you used prompt=consent and a fresh authorization code.');
                return;
            }

            $refreshToken = $data['refresh_token'];

            // Step 6: Write to .env automatically
            $envPath    = base_path('.env');
            $envContent = file_get_contents($envPath);

            if (str_contains($envContent, 'GOOGLE_REFRESH_TOKEN=')) {
                $envContent = preg_replace('/GOOGLE_REFRESH_TOKEN=.*/', 'GOOGLE_REFRESH_TOKEN=' . $refreshToken, $envContent);
            } else {
                $envContent .= "\nGOOGLE_REFRESH_TOKEN={$refreshToken}\n";
            }

            file_put_contents($envPath, $envContent);
            $this->call('config:clear');

            $this->newLine();
            $this->line('<fg=green>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</>');
            $this->line('<fg=green> ✓ Refresh token saved to .env successfully!</>');
            $this->line('<fg=green> ✓ Gmail API is now ready to send order emails.</>');
            $this->line('<fg=green>━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━</>');
            $this->newLine();
            $this->line('<fg=yellow> Now run: php artisan queue:work</>');

        } catch (\Exception $e) {
            $this->error('Failed to fetch token: ' . $e->getMessage());
        }
    }
}
