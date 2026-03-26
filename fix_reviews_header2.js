const fs = require('fs');
const file = 'frontend/app/admin/dashboard/reviews/page.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(
  /className=\{\`flex items-center gap-2 px-4 py-2 rounded-\[8px\]\s+text-\[13px\] font-bold transition-all /g,
  "className={`flex-1 justify-center sm:flex-none flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all "
);

fs.writeFileSync(file, txt);
console.log('Fixed buttons!');
