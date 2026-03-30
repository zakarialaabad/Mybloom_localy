#!/bin/bash
# ─────────────────────────────────────────────────────────────
# WhatsApp Integration - Quick Reference Card
# ─────────────────────────────────────────────────────────────

# SETUP (First Time)
cd backend
php artisan migrate
php artisan whatsapp:setup
php artisan queue:work --tries=2 --timeout=120 --verbose

# DAILY OPERATIONS

# Monitor messages being sent (real-time)
tail -f storage/logs/laravel.log | grep -i whatsapp

# Check queue status
php artisan queue:monitor

# List failed jobs
php artisan queue:failed

# Retry one failed job
php artisan queue:retry {job_id}

# Retry all failed jobs
php artisan queue:retry all

# Clear old queue entries
php artisan queue:prune

# DEBUGGING

# Check specific order's WhatsApp delivery
grep "LX-TKWO-NNO" storage/logs/laravel.log

# Verify opt-in flag (database)
sqlite3 database/database.sqlite \
  "SELECT order_number, customer_phone, whatsapp_opt_in FROM orders ORDER BY created_at DESC LIMIT 5;"

# Test template sending (one-off)
php artisan tinker
> $service = app(\App\Services\WhatsAppService::class);
> $service->sendTemplate('+212611955060', 'order_confirmation', ['John', 'LX-123', '1500 DH']);

# ENVIRONMENT (.env)

# Required
WHATSAPP_API_TOKEN=...
WHATSAPP_PHONE_NUMBER_ID=1089543844237085

# Recommended
WHATSAPP_ADMIN_PHONE=+212639760141
WHATSAPP_TEMPLATE_ORDER_CONFIRMATION=order_confirmation

# CODE REFERENCE

# Dispatch message in code
use App\Jobs\SendWhatsAppNotification;
SendWhatsAppNotification::dispatch($orderNumber, 'order_confirmation');

# Validate phone number
use App\Services\WhatsAppService;
WhatsAppService::isValidPhone('+212611955060');  // true
WhatsAppService::formatPhone('0611955060');  // +212611955060

# Check if message sent successfully
$result = $whatsAppService->sendTemplate(
  to: '+212611955060',
  templateName: 'order_confirmation',
  params: ['John', 'LX-123', '1500 DH']
);
if ($result['ok']) {
  Log::info("Message sent: {$result['message_id']}");
}

# API ENDPOINTS

# Create order (with WhatsApp opt-in)
POST /api/v1/orders
{
  "customer_phone": "+212611955060",
  "whatsapp_opt_in": true,
  ...
}

# Manually send notification
POST /api/v1/orders/{orderNumber}/send-invoice

# Download invoice PDF
GET /api/v1/invoices/{orderNumber}/download

# COMMON ERRORS

# Error #131030: Recipient not in allowed list
→ In PRODUCTION: This shouldn't happen
→ In SANDBOX: Add number to approved list in Meta Dashboard

# Error #1200: Unsupported request
→ Template name doesn't match Meta Template Manager
→ Check: php artisan whatsapp:setup

# Error #403: Access denied
→ API token invalid/expired
→ Generate new System User token in Meta Dashboard

# Error #429: Rate limited
→ Too many requests too fast
→ Job retry already handles this (30s backoff built-in)

# DATABASE SCHEMA

CREATE TABLE orders (
  ...
  whatsapp_opt_in BOOLEAN DEFAULT FALSE,
  ...
);

# CHECK MIGRATION WAS APPLIED
php artisan migrate:status | grep whatsapp

# FILES STRUCTURE

backend/
├── app/
│   ├── Jobs/SendWhatsAppNotification.php
│   ├── Services/WhatsAppService.php
│   ├── Console/Commands/WhatsAppSetupCommand.php
│   └── Http/Requests/StoreOrderRequest.php
├── config/whatsapp-templates.php
└── database/migrations/2026_03_28_000002_*.php

frontend/
└── app/checkout/page.tsx  (with opt-in checkbox)

documentation/
├── WHATSAPP_PRODUCTION_SETUP.md
├── WHATSAPP_API_EXAMPLES.js
└── IMPLEMENTATION_COMPLETE.md

# DEPLOYMENT CHECKLIST

[ ] Production access from Meta (1-7 days)
[ ] Templates created and approved in Meta
[ ] .env variables configured
[ ] Migrations run: php artisan migrate
[ ] Queue worker started: php artisan queue:work
[ ] Test order placed: verify WhatsApp delivery
[ ] Logs monitored: tail -f storage/logs/laravel.log
[ ] Admin notified of successful deployment
[ ] Error alerts configured (Slack/PagerDuty)

# MONITORING (Production)

# Success metrics
SELECT 
  COUNT(*) as total_messages,
  SUM(CASE WHEN whatsapp_opt_in THEN 1 ELSE 0 END) as opted_in,
  DATE(created_at) as date
FROM orders
WHERE created_at > NOW() - INTERVAL 30 DAY
GROUP BY DATE(created_at)
ORDER BY date DESC;

# Failure rate
grep "error" storage/logs/laravel.log | wc -l
php artisan queue:failed | wc -l

# Message delivery time (from logs)
tail -100 storage/logs/laravel.log | grep "SendWhatsAppNotification"

# SUPPORT

Setup guide:
  php artisan whatsapp:setup

Full documentation:
  cat WHATSAPP_PRODUCTION_SETUP.md

API examples:
  cat WHATSAPP_API_EXAMPLES.js

Meta API status:
  https://stats.facebook.com

Meta developer support:
  https://developers.facebook.com/support

# ─────────────────────────────────────────────────────────────
# Last Updated: March 28, 2026
# Status: Production Ready ✅
# ─────────────────────────────────────────────────────────────
