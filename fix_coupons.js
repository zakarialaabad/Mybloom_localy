const fs = require('fs');

const files = [
  'frontend/app/admin/dashboard/coupons/create/page.tsx', 
  'frontend/app/admin/dashboard/coupons/[id]/edit/page.tsx'
];

files.forEach(file => {
  let data = fs.readFileSync(file, 'utf8');
  // Fixed grid cols replacements
  data = data.replace(/grid grid-cols-2/g, 'grid grid-cols-1 sm:grid-cols-2');
  data = data.replace(/grid grid-cols-3/g, 'grid grid-cols-1 sm:grid-cols-3');
  fs.writeFileSync(file, data);
});
console.log('done');