<?php
namespace App\Console\Commands;
use Illuminate\Console\Command;
use App\Services\GmailService;

class TestEmail extends Command {
    protected $signature = "test:email";
    protected $description = "Test Gmail API sending";
    public function handle(GmailService $gmail) {
        try {
            $gmail->sendEmail(
                "zakarialaalbad200@gmail.com",
                "Test Order Email - Parfum Store",
                "<h2>Test Email</h2><p>Gmail API is working correctly via OAuth2 refresh token.</p>"
            );
            $this->info("Email sent successfully via Gmail API!");
        } catch (\Exception $e) {
            $this->error("Failed: " . $e->getMessage());
        }
    }
}
