<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

/**
 * WhatsApp Configuration Guide & Setup Helper
 * 
 * Usage:
 *   php artisan whatsapp:setup
 * 
 * PRODUCTION SETUP STEPS:
 * 1. Get production access from Meta (1-7 days)
 * 2. Create templates in Meta Template Manager
 * 3. Configure templates in whatsapp-templates.php
 * 4. Set environment variables (.env)
 * 5. Run this command to verify setup
 */
class WhatsAppSetupCommand extends Command
{
    protected $signature = 'whatsapp:setup';
    protected $description = 'Guide for WhatsApp production setup';

    public function handle(): int
    {
        $this->printHeader();
        $this->section('PRODUCTION SETUP CHECKLIST');
        
        // Check environment variables
        $this->checkEnvironment();

        // Check templates configuration
        $this->checkTemplatesConfig();

        // Display setup guide
        $this->displaySetupGuide();

        return Command::SUCCESS;
    }

    private function printHeader(): void
    {
        $this->line('');
        $this->info('╔══════════════════════════════════════════════════════════════╗');
        $this->info('║   MyBloom WhatsApp Cloud API - Production Setup Guide        ║');
        $this->info('║   Meta Cloud API v19.0 (Template-Based Messages)            ║');
        $this->info('╚══════════════════════════════════════════════════════════════╝');
        $this->line('');
    }

    private function checkEnvironment(): void
    {
        $this->section('1. ENVIRONMENT VARIABLES');

        $required = [
            'WHATSAPP_API_TOKEN'        => env('WHATSAPP_API_TOKEN'),
            'WHATSAPP_PHONE_NUMBER_ID'  => env('WHATSAPP_PHONE_NUMBER_ID'),
            'WHATSAPP_COUNTRY_CODE'     => env('WHATSAPP_COUNTRY_CODE', '212'),
        ];

        $admin = [
            'WHATSAPP_ADMIN_PHONE'      => config('services.whatsapp.admin_phone'),
        ];

        foreach ($required as $key => $value) {
            if (empty($value)) {
                $this->error("  ✗ {$key} not set in .env");
            } else {
                $this->info("  ✓ {$key} configured");
            }
        }

        $this->line('');
        $this->line('Optional environment variables:');
        foreach ($admin as $key => $value) {
            if (empty($value)) {
                $this->warn("  ○ {$key} (for admin notifications)");
            } else {
                $this->info("  ✓ {$key} configured");
            }
        }
    }

    private function checkTemplatesConfig(): void
    {
        $this->section('2. MESSAGE TEMPLATES');

        $templates = config('whatsapp-templates.templates', []);

        if (empty($templates)) {
            $this->error('  ✗ No templates configured in config/whatsapp-templates.php');
            return;
        }

        foreach ($templates as $event => $config) {
            $metaName = $config['template_meta_name'] ?? 'NOT SET';
            $this->info("  ✓ {$event}: {$metaName}");
            $this->line("    Params: " . implode(', ', $config['params'] ?? []));
        }
    }

    private function displaySetupGuide(): void
    {
        $this->section('3. SETUP STEPS');

        $steps = [
            [
                'step' => 'Get Production Access',
                'details' => [
                    '1. Go to https://developers.facebook.com/my-apps/',
                    '2. Select your WhatsApp app',
                    '3. Navigate to Settings > App Roles',
                    '4. Request production access (1-7 days approval)',
                    '5. Verify your business phone number with Meta',
                ],
            ],
            [
                'step' => 'Create Message Templates',
                'details' => [
                    '1. Go to Meta App Dashboard > WhatsApp > Template Manager',
                    '2. Create templates matching your event types:',
                    '',
                    '  Template: order_confirmation',
                    '  Category: MARKETING or TRANSACTIONAL',
                    '  Language: en_US (or your preferred language)',
                    '  Body:',
                    '  "Hi {{1}}, thanks for your order!',
                    '   Order ID: {{2}}',
                    '   Total: {{3}} DH',
                    '   Track: https://mybloom.com/track?order={{2}}"',
                    '',
                    '  [Repeat for each event type]',
                ],
            ],
            [
                'step' => 'Update Configuration',
                'details' => [
                    '1. Edit config/whatsapp-templates.php',
                    '2. Update template names to match Meta Template Manager:',
                    '   "template_meta_name" => env("WHATSAPP_TEMPLATE_ORDER_CONFIRMATION", "order_confirmation")',
                    '3. Update .env with template names:',
                    '   WHATSAPP_TEMPLATE_ORDER_CONFIRMATION=order_confirmation',
                    '   WHATSAPP_TEMPLATE_ORDER_SHIPPED=order_shipped',
                    '   etc...',
                ],
            ],
            [
                'step' => 'Test Campaign',
                'details' => [
                    '1. Add your personal phone number to approved recipients list in Meta',
                    '2. Place a test order through checkout',
                    '3. Verify WhatsApp message arrives',
                    '4. Check logs: tail -f storage/logs/laravel.log | grep WhatsApp',
                    '5. Monitor queue: php artisan queue:failed',
                ],
            ],
        ];

        foreach ($steps as $index => $item) {
            $this->info(($index + 1) . '. ' . $item['step']);
            foreach ($item['details'] as $detail) {
                if (empty($detail)) {
                    $this->line('');
                } else {
                    $this->line('   ' . $detail);
                }
            }
            $this->line('');
        }
    }

    private function section(string $title): void
    {
        $this->line('');
        $this->comment('─────────────────────────────────────────────');
        $this->comment($title);
        $this->comment('─────────────────────────────────────────────');
    }
}
