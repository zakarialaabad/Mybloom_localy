const fs = require('fs');

const upgradeModal = (filePath, modalStartRegex) => {
  if (!fs.existsSync(filePath)) return;
  console.log(`Checking ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Search for fixed inset-0 wrappers and replace their flex alignment
  // Usually looks like: "fixed inset-0 z-40 flex items-center justify-center ..."
  // or "fixed inset-0 z-50 flex items-center justify-center ..."
  
  const modifiedContent = content.replace(
    /(className=["'][^"']*?fixed inset-0[^"']*?flex [^"']*?)items-center([^"']*?["'])/g,
    '$1items-end sm:items-center$2'
  ).replace(
    /(className=["'][^"']*?fixed inset-0[^"']*?)p-4([^"']*?["'])/g,
    '$1sm:p-4$2'
  );

  // Now replace the inner modal box radius to be bottom sheet on mobile:
  // usually it's `bg-white rounded-[20px]` or `bg-white rounded-2xl`
  const modifiedContent2 = modifiedContent.replace(
    /(className=["'][^"']*?bg-white [^"']*?)rounded-\[20px\]([^"']*?["'])/g,
    '$1rounded-t-[24px] sm:rounded-[24px] rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto$2'
  ).replace(
    /(className=["'][^"']*?bg-white [^"']*?)rounded-2xl([^"']*?["'])/g,
    '$1rounded-t-[24px] sm:rounded-[24px] rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto$2'
  ).replace(
    /(className=["'][^"']*?bg-white [^"']*?)rounded-\[24px\]([^"']*?["'])/g,
    '$1rounded-t-[24px] sm:rounded-[24px] rounded-b-none sm:rounded-b-[24px] w-full sm:w-auto$2'
  );

  // Only write if changed
  if (content !== modifiedContent2) {
    fs.writeFileSync(filePath, modifiedContent2, 'utf8');
    console.log(`Upgraded modals in ${filePath}`);
  }
};

const filesToCheck = [
  'frontend/components/admin/ReviewEditorModal.tsx',
  'frontend/app/admin/dashboard/orders/page.tsx',
  'frontend/app/admin/dashboard/products/page.tsx',
  'frontend/app/admin/dashboard/products/add/page.tsx',
  'frontend/app/admin/dashboard/products/[id]/edit/page.tsx',
  'frontend/app/admin/dashboard/coupons/page.tsx'
];

filesToCheck.forEach(f => upgradeModal(f));
console.log('Phase 7 execution complete.');