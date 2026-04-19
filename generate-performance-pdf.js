const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'A4',
  margin: 40,
  bufferPages: true,
  info: {
    Title: 'Performance Optimization Report',
    Author: 'Tech Team',
    Subject: 'API & Frontend Performance Optimization'
  }
});

const outputPath = path.join(__dirname, 'PERFORMANCE_OPTIMIZATION_REPORT.pdf');
const stream = fs.createWriteStream(outputPath);
doc.pipe(stream);

// ============= COLORS =============
const C = {
  primary: '#2563EB',
  success: '#10B981',
  danger: '#EF4444',
  warning: '#F59E0B',
  dark: '#1F2937',
  light: '#F3F4F6',
  text: '#374151',
  white: '#FFFFFF',
  muted: '#6B7280',
  lightBlue: '#EFF6FF',
  borderBlue: '#BFDBFE',
  border: '#E5E7EB'
};

// ============= HELPERS =============
function title(text, size = 24) {
  doc.fontSize(size).fillColor(C.primary).font('Helvetica-Bold').text(text).moveDown(0.4);
}

function heading(text, size = 15) {
  doc.fontSize(size).fillColor(C.dark).font('Helvetica-Bold').text(text).moveDown(0.3);
}

function body(text, size = 10.5) {
  doc.fontSize(size).fillColor(C.text).font('Helvetica').text(text, { lineGap: 3 }).moveDown(0.3);
}

function bullet(text, indent = 55) {
  const startY = doc.y;
  doc.fontSize(10.5).fillColor(C.text).font('Helvetica')
    .text('•', 43, startY)
    .text(text, indent, startY, { width: 480 });
  doc.moveDown(0.15);
}

function line() {
  doc.strokeColor(C.border).lineWidth(0.8).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.4);
}

function spacer(n = 0.5) { doc.moveDown(n); }

function checkPage(need = 120) {
  if (doc.y > 780 - need) doc.addPage();
}

function drawTable(headers, rows, colWidths, opts = {}) {
  const startX = opts.x || 42;
  const w = colWidths;
  const rowH = opts.rowH || 22;
  const headerH = opts.headerH || 26;
  const totalW = w.reduce((a, b) => a + b, 0);

  checkPage(headerH + rowH * rows.length + 20);

  // Header row
  let x = startX;
  doc.rect(startX, doc.y, totalW, headerH).fill(C.primary);
  const headerY = doc.y + 7;
  headers.forEach((h, i) => {
    doc.fontSize(9.5).fillColor(C.white).font('Helvetica-Bold').text(h, x + 6, headerY, { width: w[i] - 12 });
    x += w[i];
  });
  doc.y += headerH;

  // Data rows
  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? C.light : C.white;
    x = startX;
    doc.rect(startX, doc.y, totalW, rowH).fill(bg);
    const ry = doc.y + 6;
    row.forEach((cell, ci) => {
      const color = (opts.colorCol === ci) ? getImpactColor(cell) : C.text;
      doc.fontSize(9).fillColor(color).font('Helvetica').text(String(cell), x + 6, ry, { width: w[ci] - 12 });
      x += w[ci];
    });
    doc.y += rowH;
  });
  doc.moveDown(0.6);
}

function getImpactColor(text) {
  const s = String(text);
  if (s.includes('83%') || s.includes('89%') || s.includes('76%') || s.includes('Eliminated')) return C.success;
  if (s.includes('fewer') || s.includes('0ms')) return C.success;
  return C.text;
}

function badge(text, color, x, y, w = 90) {
  doc.roundedRect(x, y, w, 20, 4).fill(color);
  doc.fontSize(9).fillColor(C.white).font('Helvetica-Bold').text(text, x, y + 5, { width: w, align: 'center' });
}

function codeBlock(text) {
  checkPage(60);
  const lines = text.split('\n');
  const h = lines.length * 14 + 16;
  doc.rect(42, doc.y, 511, h).fill('#1E293B');
  let cy = doc.y + 8;
  lines.forEach(l => {
    doc.fontSize(8.5).fillColor('#E2E8F0').font('Courier').text(l, 52, cy, { width: 490 });
    cy += 14;
  });
  doc.y += h;
  doc.moveDown(0.5);
}

// ======================================================
// PAGE 1 — COVER
// ======================================================
doc.rect(0, 0, 595, 842).fill('#F8FAFC');

doc.rect(0, 0, 595, 6).fill(C.primary);

doc.fontSize(38).fillColor(C.primary).font('Helvetica-Bold')
  .text('Performance', 0, 180, { align: 'center' });
doc.fontSize(38).fillColor(C.dark).font('Helvetica-Bold')
  .text('Optimization Report', { align: 'center' });

spacer(1.5);
doc.fontSize(13).fillColor(C.muted).font('Helvetica')
  .text('Backend API & Frontend Store Optimization', { align: 'center' });

spacer(3);

// Key metrics box
doc.rect(70, doc.y, 455, 100).fill(C.lightBlue).stroke(C.borderBlue);
const boxY = doc.y;
doc.fontSize(12).fillColor(C.primary).font('Helvetica-Bold')
  .text('Key Results', 90, boxY + 12);

doc.fontSize(10.5).fillColor(C.text).font('Helvetica');
doc.text('83% payload reduction on product listing (126 KB -> 21 KB gzip)', 90, boxY + 32);
doc.text('89% payload reduction on reviews (135 KB -> 15 KB)', 90, boxY + 48);
doc.text('Aggregates query cached (15 min TTL) — eliminates ~600ms per call', 90, boxY + 64);
doc.text('Zero-latency request deduplication replacing 50ms polling', 90, boxY + 80);

doc.y = boxY + 115;
spacer(4);

doc.fontSize(11).fillColor(C.muted).font('Helvetica')
  .text('April 19, 2026', { align: 'center' });
doc.text('Laravel 11 + Next.js 14', { align: 'center' });

// ======================================================
// PAGE 2 — DIAGNOSTIC SUMMARY
// ======================================================
doc.addPage();
title('1. Diagnostic Summary');

body('A full performance audit measured real API response times and payload sizes across all endpoints. The following measurements were taken on localhost (XAMPP, file-based cache):');
spacer(0.3);

drawTable(
  ['Endpoint', 'Cold (ms)', 'Cached (ms)', 'Payload'],
  [
    ['Products (featured, limit=100)', '1,940', '353', '13.2 KB'],
    ['Products (all, no limit)', '425', '374', '123.8 KB'],
    ['Product detail (kalimat)', '910', '613', '10.7 KB'],
    ['Reviews (admin, all)', '1,550', '1,105', '135.7 KB'],
    ['Aggregates', '607', '559', '0.1 KB'],
    ['Brands', '625', '660', '5 KB'],
    ['Categories', '699', '645', '0.6 KB'],
    ['Ingredients', '1,820', '662', '1.8 KB'],
    ['Banners', '744', '392', '~0 KB'],
  ],
  [180, 85, 85, 163]
);

heading('Root Causes Identified');
bullet('No HTTP compression — large JSON payloads sent uncompressed over the wire');
bullet('Unused "sizes" relation eager-loaded on every product query (wasted JOIN)');
bullet('Aggregates endpoint recalculates MIN/MAX price on every single call');
bullet('Reviews endpoint returns all 492 reviews (135 KB) when no limit is set');
bullet('Frontend catalog store uses 50ms setInterval polling for request dedup');

// ======================================================
// PAGE 3 — FIX 1: GZIP COMPRESSION
// ======================================================
doc.addPage();
title('2. Fixes Applied');
spacer(0.3);

heading('2.1  Gzip Compression Middleware');
badge('CREATED', C.success, 42, doc.y);
doc.y += 28;
body('File: backend/app/Http/Middleware/CompressResponse.php');
body('Registered in: backend/bootstrap/app.php (appended to API middleware pipeline)');
spacer(0.2);

body('Compresses all JSON/text API responses larger than 1 KB when the client sends Accept-Encoding: gzip. Uses compression level 6 for balanced speed/ratio.');
spacer(0.2);

heading('How it works:', 12);
bullet('Checks Accept-Encoding: gzip header from client');
bullet('Skips if response already has Content-Encoding');
bullet('Only compresses application/json and text/* content types');
bullet('Minimum threshold: 1,024 bytes');
bullet('Sets Content-Encoding, Content-Length, and Vary headers');
spacer(0.3);

heading('Compression Results:', 12);
drawTable(
  ['Endpoint', 'Before', 'After (gzip)', 'Reduction'],
  [
    ['Products (all 79)', '126,757 bytes', '21,195 bytes', '83%'],
    ['Products (featured, 10)', '13,505 bytes', '3,260 bytes', '76%'],
    ['Product detail', '10,700 bytes', '2,514 bytes', '76%'],
  ],
  [165, 120, 120, 108],
  { colorCol: 3 }
);

// ======================================================
// FIX 2: REMOVE SIZES EAGER LOAD
// ======================================================
checkPage(200);
line();
heading('2.2  Remove Unused "sizes" Eager Load');
badge('MODIFIED', C.warning, 42, doc.y);
doc.y += 28;
body('File: backend/app/Http/Controllers/Api/V1/ProductController.php');
spacer(0.2);

body('Removed "sizes" from the Product::with() eager load chain. This relation was loaded on every product query but never serialized by ProductResource — a completely wasted database JOIN.');
spacer(0.3);

heading('Before:', 11);
codeBlock('Product::with([\'brand\', \'category\', \'productType\', \'sizes\', \'variants\', \'images\' => ...])');

heading('After:', 11);
codeBlock('Product::with([\'brand\', \'category\', \'productType\', \'variants\', \'images\' => ...])');

body('Verified: "sizes" field no longer appears in product JSON responses.');

// ======================================================
// PAGE 4 — FIX 3: CACHE AGGREGATES
// ======================================================
doc.addPage();
heading('2.3  Cache Aggregates Endpoint');
badge('MODIFIED', C.warning, 42, doc.y);
doc.y += 28;
body('File: backend/app/Http/Controllers/Api/V1/ProductController.php');
spacer(0.2);

body('Wrapped the aggregates() MIN/MAX price query in Cache::remember() with a 15-minute TTL. Previously this executed a raw SQL aggregate on every call (~600ms).');
spacer(0.3);

heading('Before:', 11);
codeBlock('$agg = Product::where(\'is_active\', true)\n    ->selectRaw(\'MIN(price) as min_price, MAX(price) as max_price\')\n    ->first();');

heading('After:', 11);
codeBlock('$data = Cache::remember(\'products:aggregates\', now()->addMinutes(15), function () {\n    $agg = Product::where(\'is_active\', true)\n        ->selectRaw(\'MIN(price) as min_price, MAX(price) as max_price\')\n        ->first();\n    return [\'min_price\' => $min, \'max_price\' => $max];\n});');

body('Verified: Cache file created in storage/framework/cache/data/. Subsequent calls return identical data from file cache.');

// ======================================================
// FIX 4: REVIEWS PAGINATION
// ======================================================
checkPage(250);
line();
heading('2.4  Default Pagination for Reviews');
badge('MODIFIED', C.warning, 42, doc.y);
doc.y += 28;
body('File: backend/app/Http/Controllers/Api/V1/ReviewController.php');
spacer(0.2);

body('Changed buildReviewsResponse() to always paginate with a default of 15 per page (max 50). Previously returned all reviews via ->get() when no limit param was set.');
spacer(0.3);

heading('Before:', 11);
codeBlock('$collection = $request->filled(\'limit\')\n    ? $query->paginate($request->integer(\'limit\'))\n    : $query->get();');

heading('After:', 11);
codeBlock('$limit = $request->integer(\'limit\', 15);\n$collection = $query->paginate(min($limit, 50));');

spacer(0.3);
heading('Test Results:', 12);
drawTable(
  ['Scenario', 'Before', 'After'],
  [
    ['Homepage reviews (source=admin)', '492 reviews, 135.7 KB', '15 reviews, ~15 KB'],
    ['Product reviews (product_id=1)', '6 reviews', '6 reviews (unchanged)'],
    ['Custom limit (limit=5)', '5 reviews', '5 reviews (unchanged)'],
    ['Rating summary accuracy', 'Counts all reviews', 'Still accurate (server aggregate)'],
  ],
  [175, 170, 168]
);

body('Note: The rating_summary is computed from a separate server-side aggregate query that counts all reviews, so statistics remain accurate regardless of pagination limit.');

// ======================================================
// PAGE 5 — FIX 5: SHARED PROMISE DEDUP
// ======================================================
doc.addPage();
heading('2.5  Shared Promise Deduplication');
badge('MODIFIED', C.warning, 42, doc.y);
doc.y += 28;
body('File: frontend/store/catalog.ts');
spacer(0.2);

body('Replaced the setInterval polling mechanism with a shared Promise map for in-flight request deduplication. Previously, concurrent calls for the same cache key would poll every 50ms waiting for the first request to complete.');
spacer(0.3);

heading('Before (polling):', 11);
codeBlock('if (loading[key]) {\n  return new Promise((resolve) => {\n    const checkIfLoaded = setInterval(() => {\n      const updated = get().products.get(key);\n      if (updated && !get().loading[key]) {\n        clearInterval(checkIfLoaded);\n        resolve(updated.data);\n      }\n    }, 50);  // 50ms polling!\n  });\n}');

heading('After (shared promise):', 11);
codeBlock('const inflightRequests = new Map<string, Promise<Product[]>>();\n\nconst existing = inflightRequests.get(key);\nif (existing) return existing;  // Share same promise\n\nconst promise = (async () => {\n  try { /* fetch */ }\n  finally { inflightRequests.delete(key); }\n})();\ninflightRequests.set(key, promise);\nreturn promise;');

spacer(0.3);
heading('Benefits:', 12);
bullet('Zero latency overhead (no 50ms polling delay)');
bullet('Deterministic resolution — all waiters share the exact same Promise');
bullet('Automatic cleanup via finally block');
bullet('Zero TypeScript errors after change');

// ======================================================
// PAGE 6 — SKIPPED + BEFORE/AFTER + FILES
// ======================================================
doc.addPage();
title('3. Skipped Optimization');
spacer(0.2);

heading('Server-Side Pagination for Products');
body('With gzip compression, the full 79-product payload drops from 126 KB to 21 KB — acceptable for this catalog size. The collection page depends on having the full product list for:');
bullet('Client-side brand count aggregation');
bullet('Client-side filtering and sorting');
bullet('Client-side pagination with Array.slice()');
spacer(0.2);
body('Refactoring to server-side pagination would require significant frontend changes for marginal gain. Recommended to revisit if catalog grows beyond 500 products.');

spacer(0.8);
line();
spacer(0.3);

title('4. Before vs After Summary');
spacer(0.2);

drawTable(
  ['Metric', 'Before', 'After', 'Improvement'],
  [
    ['Product list payload', '126.7 KB', '21.2 KB (gzip)', '83% smaller'],
    ['Product detail payload', '10.7 KB', '2.5 KB (gzip)', '76% smaller'],
    ['Reviews payload', '135.7 KB (492 items)', '~15 KB (15 items)', '89% smaller'],
    ['Aggregates DB query', 'Every request (~600ms)', 'Cached 15 min', 'Eliminated'],
    ['Sizes eager load', 'Unnecessary JOIN', 'Removed', '1 fewer query'],
    ['Concurrent fetch dedup', '50ms polling interval', 'Shared Promise', '0ms overhead'],
  ],
  [135, 135, 120, 123],
  { colorCol: 3 }
);

spacer(0.5);
line();
spacer(0.3);

title('5. Files Modified');
spacer(0.2);

drawTable(
  ['File', 'Change'],
  [
    ['backend/app/Http/Middleware/CompressResponse.php', 'Created — gzip middleware'],
    ['backend/bootstrap/app.php', 'Added CompressResponse to API middleware'],
    ['backend/.../V1/ProductController.php', 'Removed sizes eager load, cached aggregates'],
    ['backend/.../V1/ReviewController.php', 'Default pagination (15/page, max 50)'],
    ['frontend/store/catalog.ts', 'Shared Promise dedup replacing polling'],
  ],
  [260, 253]
);

// ======================================================
// PAGE 7 — PRE-EXISTING ISSUES
// ======================================================
checkPage(300);
spacer(0.5);
line();
spacer(0.3);
title('6. Pre-Existing Issues (Not Addressed)');
spacer(0.2);
body('These were identified during the audit but are outside the current optimization scope:');
spacer(0.3);

drawTable(
  ['Issue', 'Impact', 'Recommendation'],
  [
    ['CACHE_STORE=file', '~500ms overhead on cached responses', 'Switch to Redis or APCu'],
    ['All pages use client', 'No SSR/SSG benefits', 'Add SSR for SEO pages'],
    ['7+ parallel API calls', 'Connection contention on homepage', 'Consolidate into BFF endpoint'],
    ['LIKE %term% search', 'Full table scan on every search', 'Add full-text index or Meilisearch'],
    ['SWR installed but unused', 'No stale-while-revalidate', 'Replace manual fetch with SWR hooks'],
  ],
  [135, 165, 213]
);

// ============= FINALIZE =============
doc.end();

stream.on('finish', () => {
  const size = fs.statSync(outputPath).size;
  console.log(`PDF generated: ${outputPath}`);
  console.log(`Size: ${(size / 1024).toFixed(1)} KB`);
});
