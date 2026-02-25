const fs         = require('fs');
const path       = require('path');
const { marked } = require('marked');
const puppeteer  = require('puppeteer');

async function generate() {
  const mdPath  = path.join(__dirname, 'TECHNICAL_EXECUTION_PLAN.md');
  const pdfPath = path.join(__dirname, 'TECHNICAL_EXECUTION_PLAN.pdf');
  const body    = marked.parse(fs.readFileSync(mdPath, 'utf8'));

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --ink:    #0f172a;
    --slate:  #1e293b;
    --accent: #2563eb;
    --light:  #f1f5f9;
    --line:   #e2e8f0;
    --gold:   #cda873;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 10.5px;
    line-height: 1.75;
    color: #1a1a1a;
    background: #fff;
  }

  /* ── COVER ─────────────────────────────────── */
  .cover {
    page-break-after: always;
    height: 100vh;
    background: linear-gradient(145deg, #0f172a 0%, #1e3a5f 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 64px;
    text-align: center;
  }
  .cover-eyebrow {
    font-size: 10px;
    font-weight: 600;
    color: var(--gold);
    letter-spacing: 5px;
    text-transform: uppercase;
    margin-bottom: 20px;
  }
  .cover-brand {
    font-size: 48px;
    font-weight: 700;
    color: #fff;
    letter-spacing: -1px;
    margin-bottom: 4px;
  }
  .cover-brand-sub {
    font-size: 14px;
    letter-spacing: 8px;
    color: var(--gold);
    text-transform: uppercase;
    margin-bottom: 48px;
  }
  .cover-title {
    font-size: 26px;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
    margin-bottom: 12px;
  }
  .cover-badge {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 5px 16px;
    border-radius: 2px;
    margin-bottom: 48px;
  }
  .cover-rule {
    width: 48px; height: 2px;
    background: var(--gold);
    margin: 0 auto 32px;
  }
  .cover-meta {
    font-size: 10.5px;
    color: rgba(255,255,255,0.5);
    line-height: 2;
  }
  .cover-tags {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-top: 32px;
    flex-wrap: wrap;
  }
  .cover-tag {
    padding: 4px 12px;
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 3px;
    font-size: 9px;
    color: rgba(255,255,255,0.5);
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  /* ── CONTENT ────────────────────────────────── */
  .content {
    padding: 24px 44px;
    max-width: 860px;
    margin: 0 auto;
  }

  h1 {
    font-size: 22px; font-weight: 700; color: var(--ink);
    margin: 32px 0 10px;
    padding-bottom: 8px;
    border-bottom: 2px solid var(--accent);
    page-break-after: avoid;
  }
  h2 {
    font-size: 16px; font-weight: 700; color: var(--ink);
    margin: 24px 0 8px;
    padding-bottom: 5px;
    border-bottom: 1px solid var(--line);
    page-break-after: avoid;
  }
  h3 {
    font-size: 13px; font-weight: 600; color: var(--slate);
    margin: 18px 0 6px;
    page-break-after: avoid;
  }
  h4 {
    font-size: 11px; font-weight: 600; color: #555;
    margin: 12px 0 5px;
  }

  p  { margin-bottom: 9px; color: #333; }
  li { margin-bottom: 3px; }
  ul, ol { padding-left: 18px; margin-bottom: 9px; }
  strong { font-weight: 600; color: #111; }
  em     { font-style: italic; color: #555; }
  a      { color: var(--accent); text-decoration: none; }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0 16px;
    font-size: 10px;
    page-break-inside: auto;
  }
  thead tr { background: var(--slate); color: #fff; }
  thead th {
    padding: 6px 9px;
    text-align: left;
    font-weight: 600;
    letter-spacing: 0.2px;
    white-space: nowrap;
  }
  tbody tr { border-bottom: 1px solid var(--line); }
  tbody tr:nth-child(even) { background: var(--light); }
  tbody td { padding: 5px 9px; vertical-align: top; }

  /* Code */
  pre {
    background: var(--slate);
    color: #94a3b8;
    padding: 12px 14px;
    border-radius: 4px;
    font-size: 8.5px;
    font-family: 'Courier New', monospace;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 10px 0 14px;
    page-break-inside: avoid;
    border-left: 3px solid var(--accent);
    line-height: 1.6;
  }
  code {
    background: #e8f0fe;
    color: #1d4ed8;
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 9px;
  }
  pre code { background: none; color: inherit; padding: 0; font-size: inherit; }

  blockquote {
    border-left: 3px solid var(--accent);
    background: #eff6ff;
    padding: 8px 14px;
    margin: 10px 0;
    font-style: italic;
    color: #1e40af;
    font-size: 10px;
    border-radius: 0 3px 3px 0;
  }

  hr { border: none; border-top: 1px solid var(--line); margin: 16px 0; }

  h2::before {
    content: '';
    display: inline-block;
    width: 3px; height: 14px;
    background: var(--accent);
    margin-right: 8px;
    vertical-align: middle;
    border-radius: 2px;
  }
</style>
</head>
<body>

<div class="cover">
  <div class="cover-eyebrow">Architecture Document</div>
  <div class="cover-brand">Bloom</div>
  <div class="cover-brand-sub">Parfums</div>
  <div class="cover-title">Technical Execution Plan</div>
  <div class="cover-badge">Version 1.0 — Implementation Ready</div>
  <div class="cover-rule"></div>
  <div class="cover-meta">
    Prepared by: Principal Full-Stack Architect AI<br/>
    Date: February 25, 2026<br/>
    Source: FULLSTACK_ARCHITECTURE_REPORT.md v3.0<br/>
    Status: FINAL — No revisions pending
  </div>
  <div class="cover-tags">
    <span class="cover-tag">Next.js App Router</span>
    <span class="cover-tag">Laravel 11 + Sanctum</span>
    <span class="cover-tag">MySQL 8.0</span>
    <span class="cover-tag">13 Tables</span>
    <span class="cover-tag">Cookie Wishlist</span>
    <span class="cover-tag">Admin-Only Auth</span>
  </div>
</div>

<div class="content">
  ${body}
</div>

</body>
</html>`;

  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page    = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  await page.pdf({
    path  : pdfPath,
    format: 'A4',
    margin: { top: '16mm', right: '12mm', bottom: '16mm', left: '12mm' },
    printBackground    : true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:7.5px;color:#94a3b8;width:100%;text-align:right;padding-right:12mm;font-family:sans-serif;">Bloom Parfums — Technical Execution Plan v1.0</div>`,
    footerTemplate: `<div style="font-size:7.5px;color:#94a3b8;width:100%;text-align:center;font-family:sans-serif;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
  });
  await browser.close();

  const kb = (fs.statSync(pdfPath).size / 1024).toFixed(1);
  console.log(`✅  ${pdfPath}`);
  console.log(`    ${kb} KB`);
}

generate().catch(e => { console.error('❌', e.message); process.exit(1); });
