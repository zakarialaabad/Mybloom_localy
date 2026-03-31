/**
 * PDF Generator — GMAIL_API_ORDER_NOTIFICATION.md → GMAIL_API_ORDER_NOTIFICATION.pdf
 * Run: node generate-gmail-api-pdf.js
 */

const fs   = require('fs');
const path = require('path');

async function generatePDF() {
  const { marked } = require('marked');
  const puppeteer  = require('puppeteer');

  const mdPath  = path.join(__dirname, 'GMAIL_API_ORDER_NOTIFICATION.md');
  const pdfPath = path.join(__dirname, 'GMAIL_API_ORDER_NOTIFICATION.pdf');

  const markdown = fs.readFileSync(mdPath, 'utf-8');
  const body     = marked.parse(markdown);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Gmail API Order Notification — Parfum Store</title>
<style>
  @page { size: A4; margin: 22mm 18mm 22mm 18mm; }
  * { box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 10.5pt;
    color: #1a1a1a;
    line-height: 1.7;
    background: #fff;
  }

  /* ── Cover ─────────────────────────────────────── */
  .cover {
    background: linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 60%, #1a5276 100%);
    color: #fff;
    padding: 46px 40px 38px;
    border-radius: 6px;
    margin-bottom: 36px;
    page-break-inside: avoid;
  }
  .cover .tag      { font-size: 9pt; letter-spacing: 0.4em; color: #85c1e9; text-transform: uppercase; margin-bottom: 10px; }
  .cover h1        { font-size: 24pt; font-weight: 800; margin: 0 0 8px; line-height: 1.2; color: #fff; }
  .cover .sub      { font-size: 11pt; color: #aed6f1; margin-bottom: 20px; }
  .cover .meta     { font-size: 9pt; color: #7fb3d3; border-top: 1px solid rgba(133,193,233,0.35); padding-top: 14px; display: flex; gap: 32px; }
  .cover .meta span::before { content: attr(data-label) ': '; font-weight: 700; color: #aed6f1; }

  /* ── Headings ───────────────────────────────────── */
  h1 { font-size: 19pt; color: #1a5276; border-bottom: 2px solid #1a5276; padding-bottom: 6px; margin-top: 32px; }
  h2 { font-size: 14pt; color: #1f618d; border-bottom: 1px solid #d6eaf8; padding-bottom: 4px; margin-top: 26px; }
  h3 { font-size: 11pt; color: #2471a3; margin-top: 18px; }

  /* ── Code blocks ────────────────────────────────── */
  pre {
    background: #0d1b2a;
    color: #cdd9e5;
    border-radius: 6px;
    padding: 14px 16px;
    font-size: 8.2pt;
    line-height: 1.55;
    overflow: hidden;
    page-break-inside: avoid;
    margin: 12px 0;
    border-left: 4px solid #1a78c2;
  }
  code {
    font-family: 'Consolas', 'Courier New', monospace;
    font-size: 8.5pt;
  }
  p code, li code {
    background: #ebf5fb;
    color: #1a5276;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 8.2pt;
  }

  /* ── Tables ─────────────────────────────────────── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  thead tr { background: #1a5276; color: #fff; }
  thead th { padding: 8px 10px; text-align: left; font-weight: 600; }
  tbody tr:nth-child(even) { background: #eaf4fb; }
  tbody td { padding: 7px 10px; border-bottom: 1px solid #d0e8f7; vertical-align: top; }
  tbody tr:hover { background: #d4e9f7; }

  /* ── Blockquotes / callouts ─────────────────────── */
  blockquote {
    background: #fef9e7;
    border-left: 4px solid #f39c12;
    margin: 14px 0;
    padding: 10px 16px;
    border-radius: 0 4px 4px 0;
    color: #7d6608;
    font-size: 9.5pt;
  }

  /* ── Lists ──────────────────────────────────────── */
  ul, ol { padding-left: 20px; margin: 8px 0; }
  li { margin-bottom: 4px; }
  li strong { color: #1a5276; }

  /* ── Horizontal rule ─────────────────────────────── */
  hr { border: none; border-top: 1px solid #d6eaf8; margin: 22px 0; }

  /* ── Paragraphs ─────────────────────────────────── */
  p { margin: 8px 0; }
  strong { color: #154360; }

  /* ── Section badge (env sections) ───────────────── */
  .env-section {
    background: #1a5276;
    color: white;
    padding: 3px 10px;
    border-radius: 3px;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 0.05em;
  }

  /* ── Page break helpers ─────────────────────────── */
  h2 { page-break-after: avoid; }
  h3 { page-break-after: avoid; }
  table { page-break-inside: avoid; }

  /* ── Footer ─────────────────────────────────────── */
  .footer {
    margin-top: 40px;
    padding-top: 14px;
    border-top: 1px solid #d6eaf8;
    font-size: 8.5pt;
    color: #888;
    display: flex;
    justify-content: space-between;
  }
</style>
</head>
<body>

  <!-- Cover Band -->
  <div class="cover">
    <div class="tag">Parfum Store — Backend Documentation</div>
    <h1>Gmail API<br>Order Notification System</h1>
    <div class="sub">Real Implementation Guide — OAuth2 + Laravel Queues</div>
    <div class="meta">
      <span data-label="Project">Parfum Store</span>
      <span data-label="Stack">Laravel 11 + Gmail REST API</span>
      <span data-label="Date">March 31, 2026</span>
      <span data-label="Status">Production Ready</span>
    </div>
  </div>

  <!-- Markdown content -->
  ${body}

  <!-- Footer -->
  <div class="footer">
    <span>Parfum Store — Backend Documentation</span>
    <span>Gmail API Order Notification System — Confidential</span>
    <span>Generated March 31, 2026</span>
  </div>

</body>
</html>`;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' },
  });

  await browser.close();
  console.log(`✅ PDF generated: ${pdfPath}`);
}

generatePDF().catch(err => {
  console.error('❌ Error generating PDF:', err.message);
  process.exit(1);
});
