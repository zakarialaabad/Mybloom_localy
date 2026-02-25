const fs      = require('fs');
const path    = require('path');
const { marked } = require('marked');
const puppeteer  = require('puppeteer');

async function generatePDF() {
  const mdPath  = path.join(__dirname, 'FULLSTACK_ARCHITECTURE_REPORT.md');
  const pdfPath = path.join(__dirname, 'FULLSTACK_ARCHITECTURE_REPORT.pdf');
  const md      = fs.readFileSync(mdPath, 'utf8');
  const body    = marked.parse(md);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');

  :root {
    --brand: #4a403a;
    --gold:  #cda873;
    --warm:  #f4ece3;
    --code:  #1e293b;
    --line:  #e8ddd5;
  }

  * { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Inter', system-ui, sans-serif;
    font-size: 11px;
    line-height: 1.7;
    color: #1a1a1a;
    background: #fff;
  }

  /* COVER PAGE */
  .cover {
    page-break-after: always;
    height: 100vh;
    background: linear-gradient(160deg, var(--brand) 0%, #2c2420 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 60px;
    text-align: center;
  }
  .cover-logo {
    font-size: 52px;
    font-weight: 700;
    color: var(--gold);
    letter-spacing: -1px;
    margin-bottom: 6px;
  }
  .cover-sub {
    font-size: 18px;
    color: rgba(205,168,115,0.7);
    letter-spacing: 6px;
    text-transform: uppercase;
    margin-bottom: 60px;
  }
  .cover-title {
    font-size: 30px;
    font-weight: 700;
    color: #fff;
    line-height: 1.3;
    margin-bottom: 16px;
  }
  .cover-version {
    display: inline-block;
    background: var(--gold);
    color: var(--brand);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 6px 18px;
    border-radius: 2px;
    margin-bottom: 40px;
  }
  .cover-meta {
    font-size: 11px;
    color: rgba(255,255,255,0.5);
    line-height: 2;
  }
  .cover-divider {
    width: 60px;
    height: 2px;
    background: var(--gold);
    margin: 32px auto;
  }

  /* CONTENT */
  .content {
    padding: 28px 48px;
    max-width: 860px;
    margin: 0 auto;
  }

  h1 { font-size: 24px; font-weight: 700; color: var(--brand); margin: 36px 0 12px; padding-bottom: 8px; border-bottom: 2px solid var(--gold); }
  h2 { font-size: 18px; font-weight: 700; color: var(--brand); margin: 28px 0 10px; padding-bottom: 6px; border-bottom: 1px solid var(--line); }
  h3 { font-size: 14px; font-weight: 600; color: var(--brand); margin: 20px 0 8px; }
  h4 { font-size: 12px; font-weight: 600; color: #555; margin: 14px 0 6px; }

  p { margin-bottom: 10px; color: #333; }
  li { margin-bottom: 4px; }
  ul, ol { padding-left: 20px; margin-bottom: 10px; }

  strong { font-weight: 600; color: #111; }
  em { font-style: italic; color: #555; }

  a { color: var(--gold); text-decoration: none; }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0 18px;
    font-size: 10.5px;
    page-break-inside: auto;
  }
  thead tr { background: var(--brand); color: #fff; }
  thead th {
    padding: 7px 10px;
    text-align: left;
    font-weight: 600;
    letter-spacing: 0.3px;
    white-space: nowrap;
  }
  tbody tr { border-bottom: 1px solid var(--line); }
  tbody tr:nth-child(even) { background: #faf8f5; }
  tbody td { padding: 6px 10px; vertical-align: top; }

  /* Code blocks */
  pre {
    background: var(--code);
    color: #e2e8f0;
    padding: 14px 16px;
    border-radius: 4px;
    font-size: 9.5px;
    font-family: 'Courier New', monospace;
    overflow-x: hidden;
    white-space: pre-wrap;
    word-break: break-all;
    margin: 12px 0 16px;
    page-break-inside: avoid;
    border-left: 3px solid var(--gold);
  }
  code {
    background: #f1ece7;
    color: var(--brand);
    padding: 1px 5px;
    border-radius: 3px;
    font-family: 'Courier New', monospace;
    font-size: 9.5px;
  }
  pre code { background: none; color: inherit; padding: 0; font-size: inherit; }

  blockquote {
    border-left: 3px solid var(--gold);
    background: var(--warm);
    padding: 10px 16px;
    margin: 14px 0;
    font-style: italic;
    color: var(--brand);
    font-size: 10.5px;
    border-radius: 0 4px 4px 0;
  }

  hr { border: none; border-top: 1px solid var(--line); margin: 20px 0; }

  /* Section badges */
  h2::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 16px;
    background: var(--gold);
    margin-right: 10px;
    vertical-align: middle;
    border-radius: 2px;
  }
</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-logo">Bloom</div>
  <div class="cover-sub">Parfums</div>
  <div class="cover-title">Full-Stack Architecture Report</div>
  <div class="cover-version">Version 3.0 — Live Codebase Analysis</div>
  <div class="cover-meta">
    Prepared by: Senior Full-Stack Architect AI<br/>
    Date: February 25, 2026<br/>
    Scope: Next.js Frontend + Laravel Backend<br/>
    Status: Blueprint — Ready for Implementation
  </div>
  <div class="cover-divider"></div>
  <div class="cover-meta" style="font-size:10px; max-width:500px; line-height:1.8;">
    Ground-truth analysis of the live codebase.<br/>
    Covers 12 pages, 18 components, 13 data entities,<br/>
    complete database DDL, full API contract, and implementation roadmap.
  </div>
</div>

<!-- BODY -->
<div class="content">
  ${body}
</div>

</body>
</html>`;

  console.log('Launching browser…');
  const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
  const page    = await browser.newPage();

  await page.setContent(html, { waitUntil: 'networkidle0' });

  await page.pdf({
    path:   pdfPath,
    format: 'A4',
    margin: { top: '18mm', right: '14mm', bottom: '18mm', left: '14mm' },
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `<div style="font-size:8px; color:#999; width:100%; text-align:right; padding-right:14mm; font-family:sans-serif;">Bloom Parfums — Full-Stack Architecture Report v3.0</div>`,
    footerTemplate: `<div style="font-size:8px; color:#999; width:100%; text-align:center; font-family:sans-serif;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
  });

  await browser.close();

  const size = (fs.statSync(pdfPath).size / 1024).toFixed(1);
  console.log(`✅ PDF generated: ${pdfPath}`);
  console.log(`   Size: ${size} KB`);
}

generatePDF().catch(err => { console.error('❌ Failed:', err.message); process.exit(1); });
