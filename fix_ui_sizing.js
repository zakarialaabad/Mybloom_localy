const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  if (!fs.existsSync(dir)) return filelist;
  fs.readdirSync(dir).forEach(file => {
    filelist = fs.statSync(path.join(dir, file)).isDirectory()
      ? walkSync(path.join(dir, file), filelist)
      : filelist.concat(path.join(dir, file));
  });
  return filelist;
};

const applyResponsiveDesign = (filePath) => {
  if (!filePath.endsWith('.tsx')) return;
  
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. App Layout Wrappers
  content = content.replace(/(className=["'][^"']*?)px-8 py-8([^"']*?["'])/g, '$1px-4 sm:px-8 py-6 sm:py-8$2');
  content = content.replace(/(className=["'][^"']*?)p-8([^"']*?["'])/g, (match, p1, p2) => {
    if (match.includes('sm:p-8')) return match;
    return `${p1}p-5 sm:p-8${p2}`;
  });
  content = content.replace(/(className=["'][^"']*?)p-6([^"']*?["'])/g, (match, p1, p2) => {
    if (match.includes('sm:p-6')) return match;
    return `${p1}p-4 sm:p-6${p2}`;
  });

  // 2. Responsive Gaps
  content = content.replace(/(className=["'][^"']*?)\bgap-6\b([^"']*?["'])/g, (match, p1, p2) => {
    if (match.includes('sm:gap-6')) return match;
    return `${p1}gap-4 sm:gap-6${p2}`;
  });
  content = content.replace(/(className=["'][^"']*?)\bgap-8\b([^"']*?["'])/g, (match, p1, p2) => {
    if (match.includes('sm:gap-8')) return match;
    return `${p1}gap-5 sm:gap-8${p2}`;
  });

  // 3. Typography Scaling
  content = content.replace(/(className=["'][^"']*?)text-\[24px\]([^"']*?["'])/g, (match, p1, p2) => {
    if (match.includes('sm:text-[24px]')) return match;
    return `${p1}text-[20px] sm:text-[24px]${p2}`;
  });
  content = content.replace(/(className=["'][^"']*?)text-\[20px\]([^"']*?["'])/g, (match, p1, p2) => {
    if (match.includes('sm:text-[20px]')) return match;
    return `${p1}text-[18px] sm:text-[20px]${p2}`;
  });
  content = content.replace(/(className=["'][^"']*?)text-\[18px\]([^"']*?["'])/g, (match, p1, p2) => {
    if (match.includes('sm:text-[18px]')) return match;
    return `${p1}text-[16px] sm:text-[18px]${p2}`;
  });

  // Write changes if modified
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated responsive styles in: ${filePath}`);
  }
};

const directoriesTargeted = [
  'frontend/app/admin/dashboard',
  'frontend/components/admin'
];

directoriesTargeted.forEach(dir => {
  const files = walkSync(dir);
  files.forEach(file => applyResponsiveDesign(file));
});

console.log('Phase 8 & 9 scripts completed.');
