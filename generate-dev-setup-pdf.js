/**
 * PDF Generator — DEV_SETUP.md → DEV_SETUP.pdf
 * Uses the same marked + puppeteer pipeline as generate-pdf.js
 */

const fs   = require('fs');
const path = require('path');

async function generatePDF() {
  const { marked } = require('marked');
  const puppeteer  = require('puppeteer');

  const mdPath  = path.join(__dirname, 'DEV_SETUP.md');
  const pdfPath = path.join(__dirname, 'DEV_SETUP.pdf');

  const markdown = fs.readFileSync(mdPath, 'utf-8');
  const body     = marked.parse(markdown);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Dev Setup — Bloom Parfums</title>
<style>
  @page { size: A4; margin: 22mm 18mm 22mm 18mm; }
  * { box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    color: #1a1a1a;
    line-height: 1.7;
    background: #fff;
  }

  /* ── Cover ──────────────────────────────────────── */
  .cover {
    background: linear-gradient(135deg, #1a2e1a 0%, #2d4a2d 60%, #3d6b3d 100%);
    color: #fff;
    padding: 46px 40px 38px;
    border-radius: 6px;
    margin-bottom: 36px;
    page-break-inside: avoid;
  }
  .cover .brand    { font-size: 10pt; letter-spacing: 0.35em; color: #7ec87e; text-transform: uppercase; margin-bottom: 10px; }
  .cover h1        { font-size: 26pt; font-weight: 800; margin: 0 0 8px; line-height: 1.2; }
  .cover .subtitle { font-size: 11pt; color: #b8e0b8; margin-bottom: 20px; }
  .cover .meta     { font-size: 9pt; color: #90c490; border-top: 1px solid rgba(126,200,126,0.4); padding-top: 14px; display: flex; gap: 32px; }
  .cover .meta span::before { content: attr(data-label) ": "; font-weight: 600; color: #7ec87e; }

  /* ── Headings ───────────────────────────────────── */
  h1 { font-size: 18pt; color: #1a2e1a; border-bottom: 3px solid #4a8a4a; padding-bottom: 8px; margin-top: 32px; }
  h2 { font-size: 13pt; color: #2d4a2d; border-left: 4px solid #4a8a4a; padding-left: 12px; margin-top: 26px; margin-bottom: 8px; }
  h3 { font-size: 11pt; color: #3d6b3d; margin-top: 18px; margin-bottom: 4px; }

  /* ── Text ───────────────────────────────────────── */
  p    { margin: 6px 0; }
  ul, ol { margin: 6px 0 10px 20px; padding: 0; }
  li   { margin: 3px 0; }

  /* ── Tables ─────────────────────────────────────── */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 9.5pt;
    page-break-inside: avoid;
  }
  thead tr { background: #2d4a2d; color: #e0f0e0; }
  thead th { padding: 8px 10px; text-align: left; font-weight: 700; letter-spacing: 0.04em; }
  tbody tr:nth-child(even) { background: #f4faf4; }
  tbody tr:nth-child(odd)  { background: #ffffff; }
  tbody td { padding: 7px 10px; border-bottom: 1px solid #d5e8d5; vertical-align: top; }

  /* ── Code blocks ────────────────────────────────── */
  pre {
    background: #1a2e1a;
    color: #c8e6c8;
    padding: 16px 18px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 8.5pt;
    line-height: 1.55;
    margin: 14px 0;
    page-break-inside: avoid;
    border-left: 3px solid #4a8a4a;
  }
  code { font-family: 'Cascadia Code', Consolas, monospace; font-size: 8.5pt; }
  :not(pre) > code {
    background: #e8f5e8;
    color: #2d6a2d;
    padding: 1px 5px;
    border-radius: 3px;
  }

  /* ── Blockquotes ────────────────────────────────── */
  blockquote {
    border-left: 4px solid #4a8a4a;
    margin: 14px 0;
    padding: 10px 16px;
    background: #f4faf4;
    color: #3a5a3a;
    border-radius: 0 4px 4px 0;
    font-style: italic;
  }

  /* ── Misc ───────────────────────────────────────── */
  hr { border: none; border-top: 1px solid #c5dcc5; margin: 24px 0; }
  a  { color: #2d6a2d; text-decoration: none; }

  /* ── Footer ─────────────────────────────────────── */
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 2px solid #c5dcc5;
    font-size: 8.5pt;
    color: #6a8a6a;
    text-align: center;
  }

  h2 { page-break-after: avoid; }
  h3 { page-break-after: avoid; }
</style>
</head>
<body>

<div class="cover">
  <div class="brand">Developer Reference</div>
  <h1>Dev Setup Guide</h1>
  <div class="subtitle">Parfum — Local &amp; Network Configuration</div>
  <div class="meta">
    <span data-label="Project">Bloom Parfums</span>
    <span data-label="Date">March 7, 2026</span>
    <span data-label="Stack">Next.js 14 + Laravel</span>
  </div>
</div>

${body}

<div class="footer">
  Bloom Parfums — Dev Setup Guide &nbsp;·&nbsp; March 7 2026 &nbsp;·&nbsp; Internal use only
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
        <span>Bloom Parfums — Dev Setup</span>
        <span style="color:#4a8a4a;font-weight:600;">INTERNAL</span>
      </div>`,
    footerTemplate: `
      <div style="font-size:7.5pt;color:#6a8a6a;width:100%;padding:0 18mm 8px;
                  display:flex;justify-content:space-between;font-family:Arial,sans-serif;">
        <span>March 2026</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>`,
    margin: { top: '22mm', bottom: '22mm', left: '18mm', right: '18mm' },
  });

  await browser.close();

  console.log('\n✅  PDF generated successfully:');
  console.log('   ' + pdfPath);
  console.log('   Size: ' + (fs.statSync(pdfPath).size / 1024).toFixed(1) + ' KB');
}

generatePDF().catch(err => {
  console.error('❌  PDF generation failed:', err.message);
  process.exit(1);
});
