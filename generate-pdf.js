/**
 * PDF Generator — ARCHITECTURE_REPORT.md → ARCHITECTURE_REPORT.pdf
 * Requires: npm install marked puppeteer
 */

const fs   = require('fs');
const path = require('path');

async function generatePDF() {
  const { marked }    = require('marked');
  const puppeteer     = require('puppeteer');

  const mdPath  = path.join(__dirname, 'ARCHITECTURE_REPORT.md');
  const pdfPath = path.join(__dirname, 'ARCHITECTURE_REPORT.pdf');

  const markdown = fs.readFileSync(mdPath, 'utf-8');
  const body     = marked.parse(markdown);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Project Architecture Report — Bloom Parfums</title>
<style>
  /* ── Page setup ─────────────────────────────────── */
  @page { size: A4; margin: 22mm 18mm 22mm 18mm; }
  * { box-sizing: border-box; }

  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    font-size: 10.5pt;
    color: #1a1a1a;
    line-height: 1.65;
    background: #fff;
  }

  /* ── Cover header band ──────────────────────────── */
  .cover {
    background: linear-gradient(135deg, #2c2218 0%, #4a3728 60%, #6b4f38 100%);
    color: #fff;
    padding: 46px 40px 38px;
    border-radius: 6px;
    margin-bottom: 36px;
    page-break-inside: avoid;
  }
  .cover .brand    { font-size: 11pt; letter-spacing: 0.35em; color: #cda873; text-transform: uppercase; margin-bottom: 10px; }
  .cover h1        { font-size: 26pt; font-weight: 800; margin: 0 0 8px; line-height: 1.2; }
  .cover .subtitle { font-size: 11pt; color: #e5d5c0; margin-bottom: 20px; }
  .cover .meta     { font-size: 9pt; color: #c4a882; border-top: 1px solid rgba(205,168,115,0.4); padding-top: 14px; display: flex; gap: 32px; }
  .cover .meta span::before { content: attr(data-label) ": "; font-weight: 600; color: #cda873; }

  /* ── Stack badge ────────────────────────────────── */
  .stack-badges { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 16px; }
  .badge {
    background: rgba(205,168,115,0.18);
    border: 1px solid rgba(205,168,115,0.5);
    color: #f0dfc0;
    font-size: 8.5pt;
    padding: 3px 10px;
    border-radius: 20px;
    font-weight: 600;
    letter-spacing: 0.05em;
  }

  /* ── Headings ───────────────────────────────────── */
  h1 { font-size: 22pt; color: #2c2218; border-bottom: 3px solid #cda873; padding-bottom: 8px; margin-top: 36px; }
  h2 { font-size: 15pt; color: #3a2c1e; border-left: 4px solid #cda873; padding-left: 12px; margin-top: 30px; margin-bottom: 10px; }
  h3 { font-size: 11.5pt; color: #4a3728; margin-top: 22px; margin-bottom: 6px; }
  h4 { font-size: 10.5pt; color: #5a4535; margin-top: 16px; margin-bottom: 4px; }

  /* ── Paragraphs & lists ─────────────────────────── */
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
  thead tr { background: #3a2c1e; color: #f5e6d0; }
  thead th { padding: 8px 10px; text-align: left; font-weight: 700; letter-spacing: 0.04em; }
  tbody tr:nth-child(even)  { background: #fdf8f2; }
  tbody tr:nth-child(odd)   { background: #ffffff; }
  tbody tr:hover            { background: #fdf0e0; }
  tbody td { padding: 7px 10px; border-bottom: 1px solid #ede3d5; vertical-align: top; }

  /* ── Code blocks ────────────────────────────────── */
  pre {
    background: #1e1a16;
    color: #f0dfc0;
    padding: 16px 18px;
    border-radius: 6px;
    overflow-x: auto;
    font-size: 8.5pt;
    line-height: 1.55;
    margin: 14px 0;
    page-break-inside: avoid;
    border-left: 3px solid #cda873;
  }
  code {
    font-family: 'Cascadia Code', 'Consolas', 'Courier New', monospace;
    font-size: 8.5pt;
  }
  :not(pre) > code {
    background: #f5ede0;
    color: #7a4f2a;
    padding: 1px 5px;
    border-radius: 3px;
    font-size: 8.5pt;
  }

  /* ── Blockquotes ────────────────────────────────── */
  blockquote {
    border-left: 4px solid #cda873;
    margin: 14px 0;
    padding: 10px 16px;
    background: #fdf8f2;
    color: #5a4535;
    border-radius: 0 4px 4px 0;
    font-style: italic;
  }

  /* ── Horizontal rule ─────────────────────────────  */
  hr { border: none; border-top: 1px solid #e8d9c5; margin: 24px 0; }

  /* ── Links ──────────────────────────────────────── */
  a { color: #8b5e34; text-decoration: none; }

  /* ── Section callout boxes ──────────────────────── */
  .section-label {
    display: inline-block;
    background: #cda873;
    color: #2c2218;
    font-size: 8pt;
    font-weight: 800;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    padding: 3px 10px;
    border-radius: 3px;
    margin-bottom: 4px;
  }

  /* ── Footer ─────────────────────────────────────── */
  .footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 2px solid #e8d9c5;
    font-size: 8.5pt;
    color: #9a8573;
    text-align: center;
  }

  /* ── Print page-break helpers ───────────────────── */
  h2 { page-break-after: avoid; }
  h3 { page-break-after: avoid; }
  table { page-break-inside: avoid; }
  pre   { page-break-inside: avoid; }
</style>
</head>
<body>

<div class="cover">
  <div class="brand">Technical Deliverable</div>
  <h1>Project Architecture Report</h1>
  <div class="subtitle">Bloom Parfums — Full-Stack E-Commerce Platform</div>
  <div class="stack-badges">
    <span class="badge">Next.js 14 App Router</span>
    <span class="badge">Laravel REST API</span>
    <span class="badge">MySQL</span>
    <span class="badge">JWT / Sanctum</span>
    <span class="badge">Redis</span>
    <span class="badge">AWS S3</span>
  </div>
  <div class="meta">
    <span data-label="Prepared by">AI Lead Architect</span>
    <span data-label="Date">February 24, 2026</span>
    <span data-label="Version">1.0</span>
    <span data-label="Status">Final</span>
  </div>
</div>

${body}

<div class="footer">
  Bloom Parfums — Confidential Architecture Report &nbsp;·&nbsp; Generated February 24, 2026 &nbsp;·&nbsp; For internal use only
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
      <div style="font-size:7.5pt; color:#9a8573; width:100%; padding: 8px 18mm 0;
                  display:flex; justify-content:space-between; font-family:Arial,sans-serif;">
        <span>Bloom Parfums — Architecture Report</span>
        <span style="color:#cda873; font-weight:600;">CONFIDENTIAL</span>
      </div>`,
    footerTemplate: `
      <div style="font-size:7.5pt; color:#9a8573; width:100%; padding: 0 18mm 8px;
                  display:flex; justify-content:space-between; font-family:Arial,sans-serif;">
        <span>February 2026</span>
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
