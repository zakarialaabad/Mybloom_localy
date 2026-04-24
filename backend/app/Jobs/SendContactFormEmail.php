<?php

namespace App\Jobs;

use App\Models\ContactSubmission;
use App\Services\GmailService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendContactFormEmail implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Number of times the job may be attempted.
     */
    public int $tries = 3;

    /**
     * Number of seconds to wait before retrying.
     */
    public int $backoff = 30;

    public function __construct(private readonly int $submissionId) {}

    /**
     * Execute the job.
     * Triggered when a visitor submits the Contact Us form.
     * Mirrors SendAdminOrderEmail flow: receives ID, queries DB, sends email.
     */
    public function handle(GmailService $gmailService): void
    {
        // Load the contact submission from database (exactly like order email loads order)
        $submission = ContactSubmission::find($this->submissionId);

        if (! $submission) {
            Log::warning("SendContactFormEmail: Submission {$this->submissionId} not found.");
            return;
        }

        $adminEmail = env('MAIL_ADMIN_EMAIL');

        if (! $adminEmail) {
            Log::error('SendContactFormEmail: MAIL_ADMIN_EMAIL not configured in .env');
            return;
        }

        // Build HTML email body
        $htmlBody = $this->buildEmailHtml($submission);

        // Compose subject
        $subject = "📧 New Contact Form Submission - {$submission->visitor_subject}";

        // Send via Gmail API (same as SendAdminOrderEmail)
        try {
            $gmailService->sendEmail(
                to:       $adminEmail,
                subject:  $subject,
                htmlBody: $htmlBody,
            );

            // Mark submission as email sent
            $submission->update(['email_sent' => true]);

            Log::info("SendContactFormEmail: Email sent to {$adminEmail} for submission {$this->submissionId}.");
        } catch (\Throwable $e) {
            Log::error("SendContactFormEmail: Failed to send email for submission {$this->submissionId}: {$e->getMessage()}");
            throw $e; // Re-throw so the job retries
        }
    }

    /**
     * Build the HTML email body with contact form data.
     */
    private function buildEmailHtml(ContactSubmission $submission): string
    {
        $storeName = config('app.name', 'Parfum Store');
        $appUrl = config('app.url', 'https://mybloom.ma');
        $logoUrl = "{$appUrl}/logo.png";
        $visitorName = e($submission->visitor_name);
        $visitorPhone = e($submission->visitor_phone);
        $visitorSubject = e($submission->visitor_subject);
        $visitorMessage = e($submission->visitor_message);
        
        return <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>New Contact Form Submission</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:30px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:10px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#403531;padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">
                {$storeName}
              </h1>
              <p style="margin:4px 0 0;color:#d6c9bf;font-size:13px;">
                New Contact Form Submission
              </p>
            </td>
          </tr>

          <!-- Logo -->
          <tr>
            <td align="center" style="padding:20px 32px;">
              <img src="{$logoUrl}" alt="{$storeName}" style="max-width:120px;height:auto;display:block;" />
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:24px 32px;">

              <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.6;">
                Hello Admin,<br>
                A visitor has submitted a contact form on <strong>{$storeName}</strong>. Please review and respond accordingly.
              </p>

              <!-- Contact Info Card -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf9f8;border:1px solid #e8e0d8;border-radius:8px;margin-bottom:24px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:8px 0;border-bottom:1px solid #e0dbd2;">
                          <span style="font-size:13px;color:#666;font-weight:600;">VISITOR NAME</span><br>
                          <span style="font-size:14px;color:#333;font-weight:500;margin-top:4px;display:block;">{$visitorName}</span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;border-bottom:1px solid #e0dbd2;">
                          <span style="font-size:13px;color:#666;font-weight:600;">PHONE NUMBER</span><br>
                          <span style="font-size:14px;color:#333;font-weight:500;margin-top:4px;display:block;">
                            <a href="tel:{$visitorPhone}" style="color:#da2966;text-decoration:none;">{$visitorPhone}</a>
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:12px 0;">
                          <span style="font-size:13px;color:#666;font-weight:600;">SUBJECT</span><br>
                          <span style="font-size:14px;color:#333;font-weight:500;margin-top:4px;display:block;">{$visitorSubject}</span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Message Section -->
              <div style="margin-bottom:28px;">
                <h3 style="margin:0 0 12px;font-size:15px;color:#403531;font-weight:600;border-left:4px solid #da2966;padding-left:12px;">
                  Message
                </h3>
                <div style="background:#fcfcfc;border:1px solid #e8e0d8;border-radius:6px;padding:16px;max-height:300px;overflow-y:auto;">
                  <p style="margin:0;font-size:14px;color:#555;line-height:1.7;white-space:pre-wrap;word-wrap:break-word;">
                    {$visitorMessage}
                  </p>
                </div>
              </div>

              <!-- Action Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <a href="mailto:{$visitorPhone}?subject=Re:%20{$visitorSubject}" style="display:inline-block;background:#da2966;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">
                      Reply to Visitor
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Footer Note -->
              <div style="margin-top:28px;padding-top:20px;border-top:1px solid #e8e0d8;">
                <p style="margin:0;font-size:12px;color:#999;line-height:1.6;">
                  ℹ️ This is an automated notification from your {$storeName} contact form. 
                  The visitor can be reached at <strong>{$visitorPhone}</strong>.
                </p>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f9f9f9;padding:16px 32px;border-top:1px solid #e0dbd2;text-align:center;">
              <p style="margin:0;font-size:12px;color:#999;">
                © 2026 {$storeName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
HTML;
    }
}
