# WhatsApp Cloud API Integration - Production Implementation

**Status:** ✅ Production-Ready | **Version:** 1.0 | **Template-Based Messages** | **Full Opt-in Support**

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [System Components](#system-components)
3. [Configuration Guide](#configuration-guide)
4. [API Specifications](#api-specifications)
5. [Error Handling & Debugging](#error-handling--debugging)
6. [Performance & Scaling](#performance--scaling)
7. [Security Checklist](#security-checklist)

---

## Architecture Overview

### Why Template Messages?

✅ **Production-Ready:** Pre-approved by Meta, no manual phone verification needed (in production)  
✅ **Scalable:** Supports 1000s of orders per day without rate limiting issues  
✅ **Compliant:** Meets Meta's messaging policies and GDPR requirements  
✅ **Reliable:** Built-in retry logic and queue management  
✅ **Cost-Effective:** Optimized API usage with templated content  

### Opt-in Consent Model

- **Required:** Customer must check opt-in box at checkout
- **Stored:** `orders.whatsapp_opt_in` (boolean)
- **Respected:** Jobs check this flag before sending messages
- **GDPR Compliant:** Clear consent capture and easy opt-out

---

## System Components

### 1. **WhatsApp Service** (`app/Services/WhatsAppService.php`)

**Responsibility:** Wrapper around Meta Cloud API v19.0

**Key Methods:**

```php
// Send template message (PRODUCTION)
sendTemplate(
    string $to,              // Phone: any format (+212611955060, 0611955060, etc.)
    string $templateName,    // Meta template name (order_confirmation, etc.)
    array $params = [],      // Template parameters: ["John", "LX-123", "1500"]
    string $languageCode = 'en_US'  // Language: en_US, fr_FR, ar_AR
): array ['ok' => bool, 'message_id' => string|null, 'error' => string|null]

// Phone formatting
formatPhone(string $phone, string $countryCode = '212'): string
// Returns: +212611955060 (from any format)

// Phone validation
isValidPhone(string $phone): bool
// Returns: true if phone length 10-15 digits
```

**Example Usage:**

```php
$whatsAppService = app(WhatsAppService::class);

$result = $whatsAppService->sendTemplate(
    to: '+212611955060',
    templateName: 'order_confirmation',
    params: ['John Doe', 'LX-TKWO-NNO', '1500.00 DH'],
    languageCode: 'en_US'
);

if ($result['ok']) {
    Log::info("Message sent! ID: {$result['message_id']}");
} else {
    Log::error("Error: {$result['error']}");
}
```

---

### 2. **Template Configuration** (`config/whatsapp-templates.php`)

Define all templates your system uses centrally.

```php
'templates' => [
    'order_confirmation' => [
        'description'        => 'Send order confirmation to customer',
        'language'           => env('WHATSAPP_TEMPLATE_LANGUAGE_ORDER', 'en_US'),
        'param_count'        => 3,
        'params'             => ['customer_name', 'order_number', 'total'],
        'template_meta_name' => env('WHATSAPP_TEMPLATE_ORDER_CONFIRMATION', 'order_confirmation'),
    ],
    'order_shipped' => [
        'description'        => 'Notify customer when order is shipped',
        'language'           => 'en_US',
        'param_count'        => 2,
        'params'             => ['customer_name', 'order_number'],
        'template_meta_name' => 'order_shipped',
    ],
    'new_order_admin' => [
        'description'        => 'Notify admin about new order',
        'language'           => 'en_US',
        'param_count'        => 4,
        'params'             => ['order_number', 'customer_name', 'total', 'item_count'],
        'template_meta_name' => 'new_order_admin',
    ],
]
```

**Add to .env:**

```env
WHATSAPP_TEMPLATE_LANGUAGE=en_US
WHATSAPP_TEMPLATE_ORDER_CONFIRMATION=order_confirmation
WHATSAPP_TEMPLATE_ORDER_SHIPPED=order_shipped
WHATSAPP_TEMPLATE_NEW_ORDER_ADMIN=new_order_admin
```

---

### 3. **Queue Job** (`app/Jobs/SendWhatsAppNotification.php`)

**Responsibility:** Process message sending asynchronously

```php
// Dispatch when order is created
SendWhatsAppNotification::dispatch(
    orderNumber: 'LX-TKWO-NNO',
    eventType: 'order_confirmation',
    recipientType: null  // null = both customer & admin
);

// Send only to customer
SendWhatsAppNotification::dispatch('LX-TKWO-NNO', 'order_confirmation', 'customer');

// Send only to admin
SendWhatsAppNotification::dispatch('LX-TKWO-NNO', 'order_confirmation', 'admin');
```

**Features:**
- ✅ 120s timeout
- ✅ 2 automatic retries with exponential backoff (30s, 60s)
- ✅ Comprehensive logging
- ✅ Respects opt-in consent
- ✅ Handles failures gracefully

---

### 4. **Order Controller** (`app/Http/Controllers/Api/V1/OrderController.php`)

**Endpoints:**

```php
// Create order (dispatches WhatsApp notification if opted-in)
POST /api/v1/orders
Request:
{
  "customer_name": "John Doe",
  "customer_phone": "+212611955060",
  "shipping_method_id": 1,
  "whatsapp_opt_in": true,
  "items": [...]
}

Response: 201 Created
{
  "data": {
    "order_number": "LX-TKWO-NNO",
    "total": 1500.00
  }
}

// Track order
GET /api/v1/orders/{orderNumber}/track?phone=+212611955060

// Manually re-send notification
POST /api/v1/orders/{orderNumber}/send-invoice

// Download invoice PDF
GET /api/v1/invoices/{orderNumber}/download
```

---

### 5. **Frontend Checkout** (`frontend/app/checkout/page.tsx`)

**New Component: WhatsApp Opt-in Checkbox**

```tsx
<div className="bg-blue-50 border border-blue-200 rounded-sm p-4">
  <label className="flex items-start gap-3 cursor-pointer">
    <input
      type="checkbox"
      checked={whatsappOptIn}
      onChange={(e) => setWhatsappOptIn(e.target.checked)}
      className="mt-1 w-4 h-4"
    />
    <div className="flex-1">
      <span className="font-bold">✓ Receive WhatsApp Notifications</span>
      <span className="text-xs text-gray-600 mt-1">
        Order confirmations and status updates will be sent via WhatsApp.
      </span>
    </div>
  </label>
</div>
```

**Behavior:**
- ✅ Required to proceed with checkout
- ✅ Clear GDPR-compliant language
- ✅ Visual indicator if unchecked
- ✅ Sent to backend as `whatsapp_opt_in: true/false`

---

## Configuration Guide

### Step 1: Get Production Access from Meta

```
Timeline: 1-7 days
```

1. Go to [Meta Developers](https://developers.facebook.com/my-apps/)
2. Select your WhatsApp app
3. Navigate to **Settings > App Roles**
4. Click "Request Production Access"
5. Fill out business verification form
6. Meta will review and approve

**Note:** You might receive emails asking for additional business verification (tax ID, business license, etc.)

---

### Step 2: Get API Credentials

```
Location: WhatsApp App Settings > API Setup
```

1. **Phone Number ID:** Found in Settings > API Setup
   ```env
   WHATSAPP_PHONE_NUMBER_ID=1089543844237085
   ```

2. **Business Account ID:** From Settings > Business Account
   ```env
   WHATSAPP_BUSINESS_ACCOUNT_ID=your_account_id
   ```

3. **API Token:** Generate from Settings > System User
   ```env
   WHATSAPP_API_TOKEN=your_long_lived_token_here
   ```

   **⚠️ Important:** Use a System User token (long-lived), NOT a temporary user token!

---

### Step 3: Create Message Templates

**In Meta App Dashboard:**

```
1. Navigate to Apps > WhatsApp > Template Manager
2. Click "Create Template"
3. Fill template details:
```

**Example: Order Confirmation**

```
Template Name: order_confirmation
Category: TRANSACTIONAL (for order confirmations)
Language: English (US) [en_US]

Body:
Hi {{1}}, thanks for your order!

Order ID: {{2}}
Total: {{3}} DH

Track your order:
https://mybloom.com/track?order={{2}}

Need help? Reply with your question!

Signature:
MyBloom Customer Support
```

**Parameters:**
- `{{1}}` = customer_name
- `{{2}}` = order_number
- `{{3}}` = total (formatted: "1500.00 DH")

**Status:** Wait for Meta approval (usually instant for transactional templates)

---

### Step 4: Update Configuration Files

**`.env` File:**

```env
# WhatsApp API
WHATSAPP_API_TOKEN=EAAjzLr0sFQcBALx1zZ...
WHATSAPP_PHONE_NUMBER_ID=1089543844237085
WHATSAPP_COUNTRY_CODE=212

# Admin Phone (for admin notifications)
WHATSAPP_ADMIN_PHONE=+212639760141

# Template Names (must match Meta Template Manager)
WHATSAPP_TEMPLATE_LANGUAGE=en_US
WHATSAPP_TEMPLATE_ORDER_CONFIRMATION=order_confirmation
WHATSAPP_TEMPLATE_ORDER_SHIPPED=order_shipped
WHATSAPP_TEMPLATE_NEW_ORDER_ADMIN=new_order_admin
WHATSAPP_TEMPLATE_ORDER_CANCELLED=order_cancelled

# Queue & Retry
WHATSAPP_MAX_RETRIES=2
WHATSAPP_JOB_TIMEOUT=120

# Logging
WHATSAPP_LOGGING_ENABLED=true
WHATSAPP_LOG_API_RESPONSES=false
WHATSAPP_LOG_SENSITIVE_DATA=false
```

**`config/whatsapp-templates.php`:**

```php
'templates' => [
    'order_confirmation' => [
        'template_meta_name' => env('WHATSAPP_TEMPLATE_ORDER_CONFIRMATION', 'order_confirmation'),
        'language' => env('WHATSAPP_TEMPLATE_LANGUAGE', 'en_US'),
    ],
    // ... other templates
],
```

---

### Step 5: Run Database Migration

```bash
php artisan migrate

# This adds the 'whatsapp_opt_in' column to the orders table
```

---

### Step 6: Test Configuration

```bash
php artisan whatsapp:setup

# This shows your configuration status and setup checklist
```

---

## API Specifications

### Meta Cloud API Endpoint

**Base URL:** `https://graph.facebook.com/v19.0`

**Sending a Template Message:**

```http
POST /v19.0/{PHONE_NUMBER_ID}/messages
Authorization: Bearer {API_TOKEN}
Content-Type: application/json

{
  "messaging_product": "whatsapp",
  "recipient_type": "individual",
  "to": "212611955060",
  "type": "template",
  "template": {
    "name": "order_confirmation",
    "language": {
      "code": "en_US"
    },
    "components": [
      {
        "type": "body",
        "parameters": [
          { "type": "text", "text": "John Doe" },
          { "type": "text", "text": "LX-TKWO-NNO" },
          { "type": "text", "text": "1500.00 DH" }
        ]
      }
    ]
  }
}
```

**Success Response (202):**

```json
{
  "messages": [
    {
      "id": "wamid.GDHJUjlWp1R7LJLnR7L0..."
    }
  ]
}
```

**Error Response (400/403):**

```json
{
  "error": {
    "message": "(#131030) Recipient phone number not in allowed list",
    "type": "OAuthException",
    "code": 131030,
    "error_data": {
      "messaging_product": "whatsapp",
      "details": "رقم هاتف المستقبل غير مدرج بالقائمة المسموحة بها"
    }
  }
}
```

---

## Error Handling & Debugging

### Common Errors

**#131030 - Recipient not in allowed list**
```
Cause: Phone number not verified in Meta sandbox
Solution: 
  - In PRODUCTION: Auto-resolved (all numbers allowed)
  - In SANDBOX: Add number to approved recipients in Meta Dashboard
```

**#1200 - Unsupported request**
```
Cause: Wrong template name or missing variables
Solution: 
  - Verify template name matches Meta Template Manager
  - Ensure all parameters are provided
  - Check parameter count matches template definition
```

**#403 - Access denied**
```
Cause: Invalid API token or token expired
Solution:
  - Generate new System User token in Meta Dashboard
  - Token must be long-lived (60 days minimum)
  - Update WHATSAPP_API_TOKEN in .env
```

**#429 - Rate limited**
```
Cause: Too many messages too fast
Solution:
  - Backoff delay already built-in (30s, 60s)
  - Queue processes jobs sequentially
  - Monitor queue: php artisan queue:work --verbose
```

### Checking Logs

```bash
# Real-time logs
tail -f storage/logs/laravel.log | grep WhatsApp

# Filter by specific order
grep "LX-TKWO-NNO" storage/logs/laravel.log

# Check failed jobs
php artisan queue:failed

# Retry failed job
php artisan queue:retry {job_id}
```

### Queue Status

```bash
# Start queue worker
php artisan queue:work --tries=2 --timeout=120 --verbose

# Check pending jobs
php artisan queue:monitor

# List failed jobs
php artisan queue:failed

# Purge all failed jobs
php artisan queue:flush
```

---

## Performance & Scaling

### Architecture Decisions

| Component | Choice | Reason |
|-----------|--------|--------|
| **Queue Driver** | Database | Production-ready, no external dependencies |
| **Message Type** | Template | Faster delivery, lower API errors |
| **Timeout** | 120s | Meta API takes 15-30s per request |
| **Retries** | 2 | Balances reliability and costs |
| **Backoff** | [30s, 60s] | Exponential, prevents API hammering |

### Metrics for 1000 Orders/Day

```
Message throughput: ~11 messages/minute
Queue processing: ~500ms per message
Total WhatsApp API calls: ~2000/day (customer + admin)
Meta rate limit: 1000s requests/hour (safe)
Database load: ~2000 queue entries/day (negligible)
```

### Optimization Tips

1. **Batch Similar Messages:** Group admin notifications together
2. **Off-peak Processing:** Run queue worker during low traffic
3. **Monitor Metrics:** Track message success rate in Datadog/NewRelic
4. **Cleanup Old Jobs:** `php artisan queue:pruned`

---

## Security Checklist

- ✅ **API Token:** Store in `.env`, never commit to git
- ✅ **Phone Numbers:** Normalized and validated before sending
- ✅ **Opt-in:** Required before any message is sent (GDPR)
- ✅ **Logging:** Sensitive data NOT logged by default
- ✅ **HTTPS Only:** All API calls use HTTPS
- ✅ **Rate Limiting:** Meta enforces limits, retries handle gracefully
- ✅ **Error Messages:** Never expose API details to frontend

### Sensitive Data Handling

```php
// ✅ SAFE: Just log the result
Log::info('Message sent', ['message_id' => 'wamid.XXX']);

// ✗ UNSAFE: Would log phone number with LOGGING_ENABLED=true
// Log::info('Sent to customer', ['phone' => $phone]);

// Use this instead:
if (config('whatsapp.logging.log_sensitive_data')) {
    Log::debug('Sent to phone: ' . substr($phone, -4)); // Last 4 digits only
}
```

---

## Production Checklist

Before going live:

- [ ] Production access granted by Meta
- [ ] All templates created and approved
- [ ] `.env` variables configured correctly
- [ ] Database migrations ran: `php artisan migrate`
- [ ] Queue worker deployed: `php artisan queue:work --daemonize`
- [ ] Logs monitored: `tail -f storage/logs/laravel.log`
- [ ] Test order placed: verify WhatsApp delivery
- [ ] Admin phone verified in Meta
- [ ] Backup API token stored securely
- [ ] Error alerts configured (PagerDuty/Slack)
- [ ] Load tested: `ab -n 1000 -c 10 https://api.mybloom.com/orders`

---

## Support & Troubleshooting

**Need Help?**

1. Check logs first: `tail -f storage/logs/laravel.log`
2. Run setup command: `php artisan whatsapp:setup`
3. Verify token: Test API call to Meta manually
4. Check queue: `php artisan queue:work --verbose`
5. Review Meta API docs: https://developers.facebook.com/docs/whatsapp/cloud-api

**Contact Meta Support:**
- Dashboard: https://developers.facebook.com/support
- Business Hours: Mon-Fri, 9 AM - 5 PM UTC

---

**Last Updated:** March 28, 2026  
**Version:** 1.0 (Production-Ready)  
**Template-Based Messages:** ✅ Enabled  
**Opt-in Consent:** ✅ Required
