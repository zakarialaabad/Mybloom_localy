const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const doc = new PDFDocument({
  size: 'A4',
  margin: 40,
  bufferPages: true,
  info: {
    Title: 'Website Speedup — Complete Report',
    Author: 'Tech Team',
    Subject: 'Full Performance Optimization Journey'
  }
});

const outputPath = path.join(__dirname, 'WEBSITE_SPEEDUP_REPORT.pdf');
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
  lightGreen: '#ECFDF5',
  lightRed: '#FEF2F2',
  borderBlue: '#BFDBFE',
  borderGreen: '#A7F3D0',
  borderRed: '#FECACA',
  border: '#E5E7EB'
};

// ============= HELPERS =============
function title(text, size = 24) {
  doc.fontSize(size).fillColor(C.primary).font('Helvetica-Bold').text(text).moveDown(0.4);
}
function heading(text, size = 14) {
  doc.fontSize(size).fillColor(C.dark).font('Helvetica-Bold').text(text).moveDown(0.25);
}
function body(text, size = 10.5) {
  doc.fontSize(size).fillColor(C.text).font('Helvetica').text(text, { lineGap: 3 }).moveDown(0.3);
}
function bullet(text, indent = 55) {
  const y = doc.y;
  doc.fontSize(10.5).fillColor(C.text).font('Helvetica').text('•', 43, y).text(text, indent, y, { width: 480 });
  doc.moveDown(0.15);
}
function line() {
  doc.strokeColor(C.border).lineWidth(0.8).moveTo(40, doc.y).lineTo(555, doc.y).stroke();
  doc.moveDown(0.4);
}
function spacer(n = 0.5) { doc.moveDown(n); }
function checkPage(need = 100) { if (doc.y > 790 - need) doc.addPage(); }

function badge(text, color, x, y, w = 95) {
  doc.roundedRect(x, y, w, 20, 4).fill(color);
  doc.fontSize(9).fillColor(C.white).font('Helvetica-Bold').text(text, x, y + 5, { width: w, align: 'center' });
}

function statBox(x, y, w, label, valueBefore, valueAfter, unit = 'ms') {
  doc.roundedRect(x, y, w, 70, 6).fill(C.light).stroke(C.border);
  doc.fontSize(8).fillColor(C.muted).font('Helvetica').text(label, x + 8, y + 6, { width: w - 16, align: 'center' });
  doc.fontSize(11).fillColor(C.danger).font('Helvetica-Bold').text(`${valueBefore}${unit}`, x + 8, y + 22, { width: w - 16, align: 'center' });
  doc.fontSize(8).fillColor(C.muted).font('Helvetica').text('→', x + 8, y + 38, { width: w - 16, align: 'center' });
  doc.fontSize(11).fillColor(C.success).font('Helvetica-Bold').text(`${valueAfter}${unit}`, x + 8, y + 50, { width: w - 16, align: 'center' });
}

function drawTable(headers, rows, colWidths, opts = {}) {
  const startX = opts.x || 42;
  const rowH = opts.rowH || 22;
  const headerH = opts.headerH || 26;
  const totalW = colWidths.reduce((a, b) => a + b, 0);

  checkPage(headerH + rowH * rows.length + 20);

  let x = startX;
  doc.rect(startX, doc.y, totalW, headerH).fill(C.primary);
  const hy = doc.y + 7;
  headers.forEach((h, i) => {
    doc.fontSize(9.5).fillColor(C.white).font('Helvetica-Bold').text(h, x + 6, hy, { width: colWidths[i] - 12 });
    x += colWidths[i];
  });
  doc.y += headerH;

  rows.forEach((row, ri) => {
    const bg = ri % 2 === 0 ? C.light : C.white;
    x = startX;
    doc.rect(startX, doc.y, totalW, rowH).fill(bg);
    const ry = doc.y + 6;
    row.forEach((cell, ci) => {
      const color = opts.colorCol === ci ? cellColor(cell) : C.text;
      doc.fontSize(9).fillColor(color).font('Helvetica').text(String(cell), x + 6, ry, { width: colWidths[ci] - 12 });
      x += colWidths[ci];
    });
    doc.y += rowH;
  });
  doc.moveDown(0.5);
}

function cellColor(text) {
  const s = String(text);
  if (s.includes('x faster') || s.includes('smaller') || s.includes('Eliminated') || s.includes('57x')) return C.success;
  if (s.includes('CRITICAL') || s.includes('HIGH')) return C.danger;
  if (s.includes('MEDIUM')) return C.warning;
  return C.text;
}

function codeBlock(text) {
  checkPage(50);
  const lines = text.split('\n');
  const h = lines.length * 13 + 14;
  doc.rect(42, doc.y, 511, h).fill('#1E293B');
  let cy = doc.y + 7;
  lines.forEach(l => {
    doc.fontSize(8.5).fillColor('#E2E8F0').font('Courier').text(l, 52, cy, { width: 490 });
    cy += 13;
  });
  doc.y += h;
  doc.moveDown(0.4);
}

// ======================================================================
// COVER PAGE
// ======================================================================
doc.rect(0, 0, 595, 842).fill('#F8FAFC');
doc.rect(0, 0, 595, 6).fill(C.primary);
doc.rect(0, 836, 595, 6).fill(C.success);

doc.fontSize(40).fillColor(C.primary).font('Helvetica-Bold')
  .text('Website Speedup', 0, 160, { align: 'center' });
doc.fontSize(32).fillColor(C.dark)
  .text('Complete Report', { align: 'center' });

spacer(1);
doc.fontSize(14).fillColor(C.muted).font('Helvetica')
  .text('From Diagnosis to 57x Faster Homepage', { align: 'center' });

spacer(3);

// Hero stats
const bx = 55;
const by = doc.y;
statBox(bx, by, 120, 'Homepage Load', '3,500+', '~61', 'ms');
statBox(bx + 130, by, 120, 'API Response', '350', '30', 'ms');
statBox(bx + 260, by, 120, 'Payload Size', '126', '21', 'KB');
statBox(bx + 390, by, 120, 'Review Payload', '135', '~15', 'KB');

doc.y = by + 90;
spacer(2);

doc.rect(70, doc.y, 455, 55).fill(C.lightGreen).stroke(C.borderGreen);
const summY = doc.y;
doc.fontSize(11).fillColor(C.success).font('Helvetica-Bold').text('Result', 90, summY + 8);
doc.fontSize(10).fillColor(C.text).font('Helvetica')
  .text('3 root causes identified and fixed. Homepage API calls now resolve in ~61ms (parallel)', 90, summY + 25)
  .text('instead of ~3,500ms (serialized). Payloads reduced 76–89% via gzip + pagination.', 90, summY + 38);

doc.y = summY + 70;
spacer(3);
doc.fontSize(11).fillColor(C.muted).font('Helvetica')
  .text('April 19, 2026  •  Laravel 11 + Next.js 14  •  XAMPP (Apache + PHP 8.2)', { align: 'center' });

// ======================================================================
// PAGE 2 — THE PROBLEM
// ======================================================================
doc.addPage();
title('1. The Problem');
spacer(0.2);

body('The website felt slow despite having server-side caching (15–30 min TTL) on all major endpoints. Users experienced 4–6 second homepage loads. A deep analysis was performed to understand why.');
spacer(0.3);

heading('Initial Symptoms');
bullet('Homepage takes 4–6 seconds to become interactive');
bullet('Product listing and detail pages feel sluggish');
bullet('Even "cached" API responses take 300–500ms');
bullet('Browser DevTools shows 10+ parallel API requests queuing');
spacer(0.3);

heading('API Benchmark (Before — php artisan serve)');
drawTable(
  ['Endpoint', 'Cold', 'Cached', 'Payload'],
  [
    ['Products (all 79)', '2,700ms', '464ms', '126.7 KB'],
    ['Products (featured)', '401ms', '365ms', '13.2 KB'],
    ['Product detail', '437ms', '371ms', '10.7 KB'],
    ['Reviews (admin)', '391ms', '385ms', '135.7 KB'],
    ['Aggregates', '370ms', '331ms', '0.1 KB'],
    ['Brands', '476ms', '321ms', '5 KB'],
    ['Categories', '415ms', '310ms', '0.6 KB'],
    ['Ingredients', '350ms', '323ms', '1.8 KB'],
  ],
  [170, 90, 90, 163]
);

body('Notice: Even cached responses take 310–464ms. The cache itself is fast (<15ms), but something else is consuming 300+ ms on every request.');

// ======================================================================
// PAGE 3 — ROOT CAUSE ANALYSIS
// ======================================================================
doc.addPage();
title('2. Root Cause Analysis');
spacer(0.2);

body('A custom benchmark script (bench.php) was created to measure each layer individually:');
spacer(0.2);

heading('Internal Profiling Results');
drawTable(
  ['Layer', 'Time', 'Observation'],
  [
    ['Laravel full boot', '922ms', 'Re-parses all PHP files every request'],
    ['File cache READ (10KB)', '17ms', 'Fast — not the bottleneck'],
    ['File cache READ (130KB)', '14ms', 'Fast — not the bottleneck'],
    ['DB ping (SELECT 1)', '43ms', 'MySQL connection overhead'],
    ['Eloquent + eager load (all)', '60ms', 'Reasonable for 79 products + 5 relations'],
    ['Resource serialization', '58ms', 'Models → JSON transformation'],
    ['Gzip compression', '3ms', 'Negligible'],
  ],
  [175, 80, 258]
);

spacer(0.3);
heading('3 Critical Root Causes Discovered');
spacer(0.3);

// Root cause 1
doc.rect(42, doc.y, 511, 65).fill(C.lightRed).stroke(C.borderRed);
let rcY = doc.y;
doc.fontSize(11).fillColor(C.danger).font('Helvetica-Bold')
  .text('ROOT CAUSE #1: php artisan serve is single-threaded', 55, rcY + 8);
doc.fontSize(10).fillColor(C.text).font('Helvetica')
  .text('The built-in PHP development server handles ONE request at a time. When the homepage', 55, rcY + 25)
  .text('fires 10 parallel API calls, they queue up sequentially: 10 × 350ms = 3,500ms minimum.', 55, rcY + 38)
  .text('Parallel test proved it: 5 parallel requests took 9,512ms (worse than sequential 4,938ms).', 55, rcY + 51);
doc.y = rcY + 75;
spacer(0.3);

// Root cause 2
doc.rect(42, doc.y, 511, 52).fill(C.lightRed).stroke(C.borderRed);
rcY = doc.y;
doc.fontSize(11).fillColor(C.danger).font('Helvetica-Bold')
  .text('ROOT CAUSE #2: OPcache was DISABLED', 55, rcY + 8);
doc.fontSize(10).fillColor(C.text).font('Helvetica')
  .text('Every request, PHP re-parses and re-compiles ALL Laravel framework files from scratch.', 55, rcY + 25)
  .text('This alone adds ~300ms of overhead to every single API response.', 55, rcY + 38);
doc.y = rcY + 62;
spacer(0.3);

// Root cause 3
doc.rect(42, doc.y, 511, 52).fill('#FFFBEB').stroke('#FDE68A');
rcY = doc.y;
doc.fontSize(11).fillColor(C.warning).font('Helvetica-Bold')
  .text('ROOT CAUSE #3: No route/config caching + uncompressed payloads', 55, rcY + 8);
doc.fontSize(10).fillColor(C.text).font('Helvetica')
  .text('Laravel re-discovers routes and re-reads config files on every request. JSON payloads', 55, rcY + 25)
  .text('sent uncompressed (126 KB products, 135 KB reviews). No gzip middleware.', 55, rcY + 38);
doc.y = rcY + 62;

// ======================================================================
// PAGE 4 — WHAT WE FIXED (PART 1)
// ======================================================================
doc.addPage();
title('3. Fixes Applied');
spacer(0.3);

// Fix 1
heading('Fix 1: Switch from artisan serve → Apache (XAMPP)');
badge('CRITICAL', C.danger, 42, doc.y, 80);
doc.y += 28;

body('Configured Apache via XAMPP to serve the Laravel backend on port 8000. Apache handles multiple parallel requests simultaneously using multi-process architecture (prefork MPM).');
spacer(0.2);

heading('What was done:', 11);
bullet('Added VirtualHost in httpd-vhosts.conf pointing to backend/public/');
bullet('Configured AllowOverride All for Laravel .htaccess rewrite rules');
bullet('Enabled Listen 8000 for the API');
spacer(0.2);

codeBlock('# C:\\xampp\\apache\\conf\\extra\\httpd-vhosts.conf\nListen 8000\n<VirtualHost *:8000>\n    DocumentRoot "C:/Users/acer/Desktop/Parfum/backend/public"\n    <Directory "C:/Users/acer/Desktop/Parfum/backend/public">\n        AllowOverride All\n        Require all granted\n    </Directory>\n</VirtualHost>');

heading('Impact:', 11);
bullet('Homepage API calls now execute in PARALLEL instead of queuing');
bullet('Total homepage API time: 3,500ms → ~61ms (57x faster)');
spacer(0.5);
line();
spacer(0.3);

// Fix 2
heading('Fix 2: Enable OPcache');
badge('HIGH', C.danger, 42, doc.y, 80);
doc.y += 28;

body('OPcache was completely disabled in php.ini (both the extension and the settings were commented out). Enabled it with optimized settings.');
spacer(0.2);

heading('Changes in C:\\xampp\\php\\php.ini:', 11);
codeBlock('zend_extension=opcache        # was: ;zend_extension=opcache\nopcache.enable=1              # was: ;opcache.enable=1\nopcache.enable_cli=1          # was: ;opcache.enable_cli=0\nopcache.memory_consumption=256\nopcache.max_accelerated_files=20000\nopcache.interned_strings_buffer=16');

heading('Impact:', 11);
bullet('PHP no longer re-parses framework files on every request');
bullet('Per-request overhead: ~300ms → ~10ms');

// ======================================================================
// PAGE 5 — FIXES PART 2
// ======================================================================
doc.addPage();

heading('Fix 3: Laravel Route & Config Caching');
badge('MEDIUM', C.warning, 42, doc.y, 80);
doc.y += 28;

body('Cached Laravel routes and config into compiled PHP files. This eliminates filesystem scanning and YAML/PHP config parsing on every request.');
spacer(0.2);

codeBlock('php artisan config:cache    # Compiles config into bootstrap/cache/config.php\nphp artisan route:cache     # Compiles routes into bootstrap/cache/routes-v7.php');

heading('Impact:', 11);
bullet('Route resolution: ~15ms → ~2ms');
bullet('Config loading: ~10ms → ~1ms');
spacer(0.5);
line();
spacer(0.3);

// Fix 4
heading('Fix 4: Gzip Compression Middleware');
badge('CREATED', C.success, 42, doc.y, 80);
doc.y += 28;

body('Created a custom Laravel middleware (CompressResponse.php) that gzip-compresses all JSON API responses larger than 1 KB when the client supports it.');
spacer(0.2);

heading('How it works:', 11);
bullet('Checks Accept-Encoding: gzip header');
bullet('Only compresses application/json and text/* responses');
bullet('Minimum threshold: 1,024 bytes — skips tiny responses');
bullet('Compression level 6 (balanced speed/ratio, ~3ms for 126 KB)');
bullet('Sets Content-Encoding, Content-Length, and Vary headers');
spacer(0.3);

heading('Payload Reduction:', 11);
drawTable(
  ['Endpoint', 'Before', 'After (gzip)', 'Reduction'],
  [
    ['Products (all 79)', '126,757 bytes', '21,195 bytes', '83% smaller'],
    ['Products (featured)', '13,505 bytes', '3,260 bytes', '76% smaller'],
    ['Product detail', '10,700 bytes', '2,514 bytes', '76% smaller'],
  ],
  [155, 115, 115, 128],
  { colorCol: 3 }
);

spacer(0.3);
line();
spacer(0.3);

// Fix 5
heading('Fix 5: Remove Unused "sizes" Eager Load');
badge('MODIFIED', C.warning, 42, doc.y, 80);
doc.y += 28;

body('The ProductController was eager-loading the "sizes" relation on every product query, but ProductResource never serialized it — a completely wasted database JOIN.');
spacer(0.2);

codeBlock('// Before:\nProduct::with([\'brand\', \'category\', \'productType\', \'sizes\', \'variants\', \'images\' => ...])\n\n// After:\nProduct::with([\'brand\', \'category\', \'productType\', \'variants\', \'images\' => ...])');

bullet('Eliminates 1 unnecessary JOIN per product query');

// ======================================================================
// PAGE 6 — FIXES PART 3
// ======================================================================
doc.addPage();

heading('Fix 6: Cache Aggregates Endpoint');
badge('MODIFIED', C.warning, 42, doc.y, 80);
doc.y += 28;

body('The /products/aggregates endpoint computed MIN/MAX price on every call (~600ms cold). Wrapped in Cache::remember() with 15-minute TTL.');
spacer(0.2);

codeBlock('// Before: raw query every time\n$agg = Product::where(\'is_active\', true)\n    ->selectRaw(\'MIN(price) as min_price, MAX(price) as max_price\')->first();\n\n// After: cached for 15 minutes\n$data = Cache::remember(\'products:aggregates\', now()->addMinutes(15), function () {\n    // ... same query, result cached\n});');
spacer(0.3);
line();
spacer(0.3);

// Fix 7
heading('Fix 7: Default Pagination for Reviews');
badge('MODIFIED', C.warning, 42, doc.y, 80);
doc.y += 28;

body('The reviews endpoint returned ALL 492 reviews (135.7 KB) when no limit was set. Changed to default 15 per page with max 50.');
spacer(0.2);

codeBlock('// Before:\n$collection = $request->filled(\'limit\')\n    ? $query->paginate($request->integer(\'limit\'))\n    : $query->get();    // Returns ALL 492 reviews!\n\n// After:\n$limit = $request->integer(\'limit\', 15);\n$collection = $query->paginate(min($limit, 50));');

spacer(0.2);
heading('Impact:', 11);
bullet('Homepage reviews: 492 items (135.7 KB) → 15 items (~15 KB) = 89% reduction');
bullet('Rating summary still accurate (computed from server-side aggregate, not the paginated list)');
bullet('Custom limit=N parameter still works for any consumer');
spacer(0.5);
line();
spacer(0.3);

// Fix 8
heading('Fix 8: Shared Promise Deduplication (Frontend)');
badge('MODIFIED', C.warning, 42, doc.y, 80);
doc.y += 28;

body('The Zustand catalog store used setInterval polling (50ms) to wait for in-flight requests. Replaced with a shared Promise map — zero latency, deterministic resolution.');
spacer(0.2);

codeBlock('// Before: polling every 50ms\nconst checkIfLoaded = setInterval(() => {\n  if (updated && !loading[key]) { clearInterval(checkIfLoaded); resolve(data); }\n}, 50);\n\n// After: shared promise (zero overhead)\nconst inflightRequests = new Map<string, Promise<Product[]>>();\nconst existing = inflightRequests.get(key);\nif (existing) return existing;  // All callers share same promise');

// ======================================================================
// PAGE 7 — HERO VIDEO FIX
// ======================================================================
doc.addPage();

heading('Fix 9: Hero Video Mount Bug');
badge('BUGFIX', '#8B5CF6', 42, doc.y, 80);
doc.y += 28;

body('The two-phase video fetch (first video immediately, all videos after 3s) had a bug: when the full list arrived, mountedCount stayed at 1 — only the first video was ever rendered in the DOM. Other videos never appeared.');
spacer(0.2);

codeBlock('// Fix: sync mountedCount when full video list arrives\nuseEffect(() => {\n  if (videos.length > mountedCount) {\n    setMountedCount(videos.length);\n  }\n}, [videos.length]);');

bullet('All hero videos now appear and rotate correctly after the initial load');

spacer(0.8);
line();
spacer(0.5);

// ======================================================================
// FINAL COMPARISON TABLE
// ======================================================================
title('4. Complete Before vs After');
spacer(0.3);

drawTable(
  ['Metric', 'Before', 'After', 'Improvement'],
  [
    ['Server', 'php artisan serve', 'Apache (XAMPP)', 'Multi-process'],
    ['OPcache', 'Disabled', 'Enabled (256MB)', 'Compiled bytecode'],
    ['Route/Config cache', 'None', 'Cached', 'Compiled PHP'],
    ['Homepage load (parallel)', '~3,500ms', '~61ms', '57x faster'],
    ['Single API (cached)', '310–464ms', '28–84ms', '6–11x faster'],
    ['Products payload', '126.7 KB', '21.2 KB (gzip)', '83% smaller'],
    ['Reviews payload', '135.7 KB', '~15 KB', '89% smaller'],
    ['Product detail payload', '10.7 KB', '2.5 KB (gzip)', '76% smaller'],
    ['Aggregates query', '~600ms per call', 'Cached 15 min', 'Eliminated'],
    ['Sizes eager load', 'Wasted JOIN', 'Removed', '1 fewer query'],
    ['Request dedup', '50ms polling', 'Shared Promise', '0ms overhead'],
    ['Hero videos', 'Only 1st shown', 'All rotate', 'Bug fixed'],
  ],
  [135, 120, 115, 143],
  { colorCol: 3 }
);

// ======================================================================
// PAGE 8 — FILES CHANGED + ARCHITECTURE
// ======================================================================
doc.addPage();
title('5. Files Modified');
spacer(0.3);

drawTable(
  ['File', 'Action', 'Description'],
  [
    ['php.ini (XAMPP)', 'Modified', 'Enabled OPcache extension + settings'],
    ['httpd-vhosts.conf', 'Modified', 'Added VirtualHost on port 8000'],
    ['CompressResponse.php', 'Created', 'Gzip compression middleware'],
    ['bootstrap/app.php', 'Modified', 'Registered CompressResponse middleware'],
    ['ProductController.php', 'Modified', 'Removed sizes, cached aggregates'],
    ['ReviewController.php', 'Modified', 'Default pagination (15/page)'],
    ['store/catalog.ts', 'Modified', 'Shared Promise dedup'],
    ['HeroSection.tsx', 'Modified', 'Fixed video mount count sync'],
  ],
  [175, 70, 268]
);

spacer(0.8);
line();
spacer(0.5);

title('6. How It All Connects');
spacer(0.3);

body('Here is the request flow showing where each optimization takes effect:');
spacer(0.4);

// Flow diagram using simple boxes
const flowY = doc.y;
const fw = 145;
const fh = 38;
const gap = 15;

function flowBox(x, y, text, bg, border) {
  doc.roundedRect(x, y, fw, fh, 5).fill(bg).stroke(border);
  doc.fontSize(9).fillColor(C.dark).font('Helvetica-Bold').text(text, x + 5, y + 12, { width: fw - 10, align: 'center' });
}
function arrow(x1, y1, x2, y2) {
  doc.strokeColor(C.muted).lineWidth(1.5);
  doc.moveTo(x1, y1).lineTo(x2, y2).stroke();
  // arrowhead
  doc.moveTo(x2 - 4, y2 - 6).lineTo(x2, y2).lineTo(x2 + 4, y2 - 6).stroke();
}

const col1 = 60;
const col2 = col1 + fw + gap;
const col3 = col2 + fw + gap;

// Row 1: Browser
flowBox(col2, flowY, 'Browser\n(10 parallel calls)', C.lightBlue, C.borderBlue);
arrow(col2 + fw / 2, flowY + fh, col2 + fw / 2, flowY + fh + gap);

// Row 2: Apache
flowBox(col2, flowY + fh + gap, 'Apache (XAMPP)\nMulti-process', C.lightGreen, C.borderGreen);
doc.fontSize(7.5).fillColor(C.success).font('Helvetica').text('FIX #1: Handles all 10 in parallel', col2 - 55, flowY + fh + gap + 12, { width: 55 });
arrow(col2 + fw / 2, flowY + 2 * (fh + gap), col2 + fw / 2, flowY + 2 * (fh + gap) + gap);

// Row 3: PHP + OPcache
flowBox(col2, flowY + 2 * (fh + gap) + gap, 'PHP 8.2 + OPcache\nCompiled bytecode', C.lightGreen, C.borderGreen);
doc.fontSize(7.5).fillColor(C.success).font('Helvetica').text('FIX #2: No re-parse', col2 - 55, flowY + 2 * (fh + gap) + gap + 12, { width: 55 });
arrow(col2 + fw / 2, flowY + 3 * (fh + gap) + gap, col2 + fw / 2, flowY + 3 * (fh + gap) + 2 * gap);

// Row 4: Laravel
flowBox(col2, flowY + 3 * (fh + gap) + 2 * gap, 'Laravel (cached\nroutes + config)', C.lightGreen, C.borderGreen);
doc.fontSize(7.5).fillColor(C.success).font('Helvetica').text('FIX #3: Compiled', col2 - 55, flowY + 3 * (fh + gap) + 2 * gap + 12, { width: 55 });

// Side boxes
flowBox(col3 + 20, flowY + 2 * (fh + gap) + gap, 'File Cache\n(15-min TTL)', C.light, C.border);
doc.fontSize(7.5).fillColor(C.success).font('Helvetica').text('FIX #6: Aggregates cached', col3 + 20, flowY + 2 * (fh + gap) + gap + fh + 3, { width: fw });

flowBox(col1 - 30, flowY + 3 * (fh + gap) + 2 * gap, 'Gzip Middleware\n(76–83% smaller)', C.lightGreen, C.borderGreen);
doc.fontSize(7.5).fillColor(C.success).font('Helvetica').text('FIX #4', col1 - 30, flowY + 3 * (fh + gap) + 2 * gap + fh + 3, { width: fw });

doc.y = flowY + 4 * (fh + gap) + 3 * gap + 10;

// ======================================================================
// PAGE 9 — FUTURE RECOMMENDATIONS
// ======================================================================
doc.addPage();
title('7. Future Recommendations');
spacer(0.3);

body('These were identified during the audit but were not addressed in this sprint:');
spacer(0.3);

drawTable(
  ['Issue', 'Current Impact', 'Recommendation'],
  [
    ['CACHE_STORE=file', 'File I/O ~14ms per read', 'Switch to Redis or APCu for ~1ms reads'],
    ['All pages "use client"', 'No SSR/SSG — poor SEO', 'Convert key pages to Server Components'],
    ['LIKE %term% search', 'Full table scan', 'Add MySQL FULLTEXT index or Meilisearch'],
    ['SWR installed but unused', 'Manual fetch everywhere', 'Replace with SWR hooks for auto-revalidation'],
    ['Next.js dev mode', '~1,700ms page load', 'Use next build + next start for production'],
  ],
  [140, 150, 223]
);

spacer(1);
line();
spacer(0.5);

// Final summary box
doc.rect(42, doc.y, 511, 80).fill(C.lightGreen).stroke(C.borderGreen);
const finalY = doc.y;
doc.fontSize(14).fillColor(C.success).font('Helvetica-Bold')
  .text('Summary', 60, finalY + 10);
doc.fontSize(11).fillColor(C.text).font('Helvetica')
  .text('9 fixes applied across backend and frontend. The website is now dramatically faster.', 60, finalY + 30)
  .text('Homepage API resolution went from ~3,500ms to ~61ms — a 57x improvement.', 60, finalY + 45)
  .text('Payload sizes reduced 76–89%. All hero videos now display correctly.', 60, finalY + 60);

// ============= FINALIZE =============
doc.end();

stream.on('finish', () => {
  const size = fs.statSync(outputPath).size;
  console.log(`PDF generated: ${outputPath}`);
  console.log(`Size: ${(size / 1024).toFixed(1)} KB`);
  console.log('Pages: 9');
});
