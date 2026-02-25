/**
 * PDF Generator — FINAL_DECISIONS_REPORT.md → FINAL_DECISIONS_REPORT.pdf
 */

const fs        = require('fs');
const path      = require('path');
const { marked }= require('marked');
const puppeteer = require('puppeteer');

async function generatePDF() {
  const mdPath  = path.join(__dirname, 'FINAL_DECISIONS_REPORT.md');
  const pdfPath = path.join(__dirname, 'FINAL_DECISIONS_REPORT.pdf');

  const markdown = fs.readFileSync(mdPath, 'utf-8');
  const body     = marked.parse(markdown);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<title>Final Technical Decisions Report — Bloom Parfums</title>
<style>
  @page { size: A4; margin: 22mm 18mm 22mm 18mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10.5pt; color: #1a1a1a; line-height: 1.65; background: #fff; }

  .cover {
    background: linear-gradient(135deg, #1a2c1a 0%, #2d4a2d 60%, #3d6b3d 100%);
    color: #fff; padding: 46px 40px 38px; border-radius: 6px; margin-bottom: 36px; page-break-inside: avoid;
  }
  .cover .label    { font-size: 11pt; letter-spacing: 0.35em; color: #7db87d; text-transform: uppercase; margin-bottom: 10px; }
  .cover h1        { font-size: 26pt; font-weight: 800; margin: 0 0 8px; line-height: 1.2; }
  .cover .subtitle { font-size: 11pt; color: #c5d8c5; margin-bottom: 20px; }
  .cover .meta     { font-size: 9pt; color: #9ab89a; border-top: 1px solid rgba(125,184,125,0.4); padding-top: 14px; display: flex; gap: 32px; flex-wrap: wrap; }
  .cover .meta span::before { content: attr(data-label) ": "; font-weight: 600; color: #7db87d; }
  .badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
  .badge  { background: rgba(125,184,125,0.18); border: 1px solid rgba(125,184,125,0.5); color: #d0e8d0; font-size: 8.5pt; padding: 3px 10px; border-radius: 20px; font-weight: 600; }

  h1 { font-size: 22pt; color: #1a2c1a; border-bottom: 3px solid #4a8a4a; padding-bottom: 8px; margin-top: 36px; }
  h2 { font-size: 15pt; color: #2d4a2d; border-left: 4px solid #4a8a4a; padding-left: 12px; margin-top: 30px; margin-bottom: 10px; }
  h3 { font-size: 11.5pt; color: #3d6b3d; margin-top: 22px; margin-bottom: 6px; }
  h4 { font-size: 10.5pt; color: #4a7a4a; margin-top: 16px; margin-bottom: 4px; }
  p  { margin: 6px 0; }
  ul, ol { margin: 6px 0 10px 20px; padding: 0; }
  li { margin: 3px 0; }

  table { width: 100%; border-collapse: collapse; margin: 14px 0; font-size: 9.5pt; page-break-inside: avoid; }
  thead tr { background: #2d4a2d; color: #d0e8d0; }
  thead th { padding: 8px 10px; text-align: left; font-weight: 700; }
  tbody tr:nth-child(even) { background: #f2f8f2; }
  tbody tr:nth-child(odd)  { background: #ffffff; }
  tbody td { padding: 7px 10px; border-bottom: 1px solid #d5e8d5; vertical-align: top; }

  pre  { background: #111e11; color: #c8e8c8; padding: 16px 18px; border-radius: 6px; font-size: 8.5pt; line-height: 1.55; margin: 14px 0; page-break-inside: avoid; border-left: 3px solid #4a8a4a; }
  code { font-family: 'Cascadia Code','Consolas','Courier New',monospace; font-size: 8.5pt; }
  :not(pre) > code { background: #eaf4ea; color: #2a5a2a; padding: 1px 5px; border-radius: 3px; }

  blockquote { border-left: 4px solid #4a8a4a; margin: 14px 0; padding: 10px 16px; background: #f2f8f2; color: #3a5a3a; border-radius: 0 4px 4px 0; font-style: italic; }
  hr  { border: none; border-top: 1px solid #d5e8d5; margin: 24px 0; }
  a   { color: #2a5a2a; text-decoration: none; }
  h2  { page-break-after: avoid; }
  h3  { page-break-after: avoid; }

  .footer { margin-top: 48px; padding-top: 16px; border-top: 2px solid #d5e8d5; font-size: 8.5pt; color: #6a8a6a; text-align: center; }
</style>
</head>
<body>

<div class="cover">
  <div class="label">Supersedes Architecture Report v1.0</div>
  <h1>Final Technical Decisions Report</h1>
  <div class="subtitle">Bloom Parfums — Stateless-Customer E-Commerce Platform</div>
  <div class="badges">
    <span class="badge">Next.js 14 Hybrid</span>
    <span class="badge">Laravel API-only</span>
    <span class="badge">MySQL + Redis</span>
    <span class="badge">Cookie Wishlist</span>
    <span class="badge">Admin-Only Auth</span>
    <span class="badge">Guest Checkout</span>
  </div>
  <div class="meta">
    <span data-label="Prepared by">Principal Architect AI</span>
    <span data-label="Date">February 25, 2026</span>
    <span data-label="Version">2.0 — FINAL</span>
    <span data-label="Status">Approved for Development</span>
  </div>
</div>

${body}

<div class="footer">
  Bloom Parfums — Final Technical Decisions Report &nbsp;·&nbsp; February 25, 2026 &nbsp;·&nbsp; Supersedes v1.0 &nbsp;·&nbsp; Confidential
</div>

</body>
</html>`;

  console.log('Launching browser…');
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size:7.5pt;color:#6a8a6a;width:100%;padding:8px 18mm 0;
                  display:flex;justify-content:space-between;font-family:Arial,sans-serif;">
        <span>Bloom Parfums — Final Decisions Report</span>
        <span style="color:#4a8a4a;font-weight:600;">FINAL v2.0</span>
      </div>`,
    footerTemplate: `
      <div style="font-size:7.5pt;color:#6a8a6a;width:100%;padding:0 18mm 8px;
                  display:flex;justify-content:space-between;font-family:Arial,sans-serif;">
        <span>February 2026</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`,
    margin: { top: '22mm', bottom: '22mm', left: '18mm', right: '18mm' }
  });
  await browser.close();

  console.log('\n✅  PDF generated successfully:');
  console.log('   ' + pdfPath);
  console.log('   Size: ' + (fs.statSync(pdfPath).size / 1024).toFixed(1) + ' KB');
}

generatePDF().catch(err => {
  console.error('❌  Failed:', err.message);
  process.exit(1);
});
