/**
 * WhatsApp Integration Example
 * 
 * Complete frontend API integration example showing how to:
 * 1. Capture opt-in consent
 * 2. Send order with WhatsApp flag
 * 3. Handle responses
 * 4. Display notifications
 */

// ──────────────────────────────────────────────────────────────
// 1. API Request Payload (from Frontend)
// ──────────────────────────────────────────────────────────────

const createOrderPayload = {
  // Customer information
  customer_name: "John Doe",
  customer_phone: "+212611955060",  // MUST be in +212XXXXXXXXX format
  customer_email: "john@example.com",

  // WhatsApp opt-in (required!)
  whatsapp_opt_in: true,

  // Shipping
  shipping_method_id: 1,
  shipping_address: {
    address: "123 Main Street",
    city: "Casablanca",
    quartier: "Anfa",
    zip: "20000"
  },

  // Coupon (optional)
  coupon_code: "SUMMER20",

  // Order items
  items: [
    {
      product_id: 5,
      size_id: 12,  // ProductVariant or ProductSize ID
      quantity: 2
    },
    {
      product_id: 8,
      size_id: 0,   // No size variant
      quantity: 1
    }
  ],

  // Optional
  notes: "Gift wrap please"
};

// ──────────────────────────────────────────────────────────────
// 2. Frontend API Service Implementation
// ──────────────────────────────────────────────────────────────

import axios from 'axios';

export const orderService = {
  async place(data) {
    // Validate opt-in before sending
    if (!data.whatsapp_opt_in) {
      throw new Error('WhatsApp opt-in is required');
    }

    // Validate phone format
    const phoneRegex = /^\+212[567]\d{8}$/;
    if (!phoneRegex.test(data.customer_phone)) {
      throw new Error('Invalid phone number format. Use +212XXXXXXXXX');
    }

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders`,
        data,
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 15000  // 15 second timeout
        }
      );

      return response.data.data;  // { order_number, total }

    } catch (error) {
      // Handle validation errors
      if (error.response?.status === 422) {
        const errors = error.response.data.errors || {};
        const firstError = Object.values(errors)[0];
        throw new Error(firstError?.[0] || 'Validation error');
      }

      // Handle other errors
      throw new Error(
        error.message === 'Network Error'
          ? 'Connection error. Please check your internet.'
          : error.response?.data?.message || 'Failed to place order'
      );
    }
  }
};

// ──────────────────────────────────────────────────────────────
// 3. React Checkout Component with Opt-in
// ──────────────────────────────────────────────────────────────

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutForm() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    whatsapp_opt_in: false,
    // ... other fields
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      // Validate WhatsApp opt-in first
      if (!formData.whatsapp_opt_in) {
        setErrors({ whatsapp_opt_in: 'You must accept WhatsApp notifications' });
        return;
      }

      // Call API
      const order = await orderService.place(formData);

      // Show success message
      console.log('[WhatsApp] ✅ Order queued. Invoice will arrive shortly on WhatsApp.');

      // Redirect to success page
      router.push(`/success?order=${order.order_number}`);

    } catch (error) {
      setErrors({ submit: error.message });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ... other form fields ... */}

      {/* WhatsApp Opt-in Checkbox */}
      <div className="bg-blue-50 border border-blue-200 rounded p-4 my-6">
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.whatsapp_opt_in}
            onChange={(e) => 
              setFormData({ ...formData, whatsapp_opt_in: e.target.checked })
            }
            className="mt-1 w-4 h-4"
          />
          <div>
            <span className="block font-bold">
              ✓ Receive WhatsApp Notifications
            </span>
            <span className="block text-sm text-gray-600 mt-1">
              You will receive order confirmation and delivery updates via WhatsApp.
              You can opt-out anytime.
            </span>
          </div>
        </label>

        {/* Show error if not accepted */}
        {errors.whatsapp_opt_in && (
          <p className="text-red-600 text-sm mt-2">⚠️ {errors.whatsapp_opt_in}</p>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!formData.whatsapp_opt_in}  // Disable until opt-in
        className="w-full bg-blue-600 text-white py-3 rounded disabled:opacity-50"
      >
        Complete Order
      </button>
    </form>
  );
}

// ──────────────────────────────────────────────────────────────
// 4. Expected Backend Response
// ──────────────────────────────────────────────────────────────

// Success Response (201 Created)
{
  "data": {
    "order_number": "LX-TKWO-NNO",
    "total": 1500.00
  },
  "message": "Order placed successfully."
}

// Validation Error Response (422 Unprocessable Entity)
{
  "message": "The given data was invalid.",
  "errors": {
    "customer_phone": [
      "Invalid phone number format"
    ],
    "whatsapp_opt_in": [
      "The whatsapp_opt_in field is required."
    ]
  }
}

// ──────────────────────────────────────────────────────────────
// 5. Backend Flow Diagram
// ──────────────────────────────────────────────────────────────

/*
FRONTEND                          BACKEND                      QUEUE                 WHATSAPP API
  │                                 │                            │                        │
  ├─► POST /api/v1/orders ─────────►│                            │                        │
  │   (with whatsapp_opt_in)       │                            │                        │
  │                                ├─ Validate request          │                        │
  │                                ├─ Create order              │                        │
  │   ◄─────── 201 Created ────────┤ Dispatch queue job         │                        │
  │   (order_number, total)        │ Return immediately         │                        │
  │                                │                            │                        │
  │                                │                       Fetch job ──────────────────►│
  │                                │                            │ GET template message   │
  │                                │                            │ Send to Meta API       │
  │                                │                            │◄─────── 202 Queued ───
  │                                │                            │                        │
  │   SHOW: "Facture envoyée!" │                            │ (Carrier delivers)    │
  │                                │                            │                        │
*/

// ──────────────────────────────────────────────────────────────
// 6. Error Scenarios & Handling
// ──────────────────────────────────────────────────────────────

// Scenario 1: Phone number not opted in
{
  "ok": false,
  "error": "Customer phone not provided or opted-in: false",
  "action": "Show: 'WhatsApp notification not sent (opted out)'"
}

// Scenario 2: Template not found
{
  "ok": false,
  "error": "#1200 Unsupported request - template not found",
  "action": "Admin notified, check WhatsApp Template Manager"
}

// Scenario 3: API token expired
{
  "ok": false,
  "error": "#403 Access denied - invalid token",
  "action": "Retry scheduled, admin alerted to regenerate token"
}

// Scenario 4: Success
{
  "ok": true,
  "message_id": "wamid.GDHJUjlWp1R7LJLnR7L0...",
  "error": null,
  "action": "Customer receives WhatsApp message in ~1-30 seconds"
}

// ──────────────────────────────────────────────────────────────
// 7. Monitoring & Debugging
// ──────────────────────────────────────────────────────────────

// Check if WhatsApp messages are being sent:
php artisan queue:work --verbose

// View recent logs:
tail -f storage/logs/laravel.log | grep "SendWhatsAppNotification"

// Example log output:
[2026-03-28 15:30:42] local.INFO: SendWhatsAppNotification: customer [+212611955060]
{
  "order_number": "LX-TKWO-NNO",
  "event": "order_confirmation",
  "ok": true,
  "message_id": "wamid.GDHJUjlWp1R7LJLnR7L0...",
  "error": null
}

// Check failed jobs:
php artisan queue:failed

// Retry a failed job:
php artisan queue:retry {job_id}

// ──────────────────────────────────────────────────────────────
// 8. Complete End-to-End Test Checklist
// ──────────────────────────────────────────────────────────────

// 1. Environment Setup
✓ WHATSAPP_API_TOKEN set in .env
✓ WHATSAPP_PHONE_NUMBER_ID set in .env
✓ Databases migrated (whatsapp_opt_in column exists)

// 2. Template Setup
✓ Create template in Meta Template Manager
✓ Template name matches config/whatsapp-templates.php
✓ Template approved by Meta

// 3. Frontend Test
✓ Opt-in checkbox appears on checkout form
✓ Form won't submit without opt-in checked
✓ Phone validation works (+212XXXXXXXXX format)

// 4. Backend Test
✓ POST /api/v1/orders returns 201 with order_number
✓ whatsapp_opt_in=true stored in orders table
✓ Queue job created (check jobs table)

// 5. Queue Test
✓ php artisan queue:work shows job processing
✓ No errors in laravel.log
✓ WhatsApp message arrives on phone in <30 seconds

// 6. Monitoring
✓ Check logs: grep "SendWhatsAppNotification" storage/logs/laravel.log
✓ No failed jobs: php artisan queue:failed
✓ Database: Select * from orders where whatsapp_opt_in = 1 ORDER BY created_at DESC;

*/
