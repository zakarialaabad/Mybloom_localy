const fs = require('fs');
const file = 'frontend/app/admin/dashboard/reviews/page.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(
  "                className={`flex items-center gap-2 px-4 py-2 rounded-[8px] \\\n                    text-[13px] font-bold transition-all ${",
  "                className={`flex justify-center sm:flex-none flex-1 items-center gap-2 px-4 py-2 rounded-[8px] \\\n                    text-[13px] font-bold transition-all ${"
);

// wait let me just replace all matching
txt = txt.replace(/className=\{\`flex items-center gap-2 px-4 py-2 rounded-\[8px\][\s\n\r]*text-\[13px\] font-bold transition-all/g,
  "className={`flex-1 justify-center sm:flex-none flex items-center gap-2 px-4 py-2 rounded-[8px] text-[13px] font-bold transition-all");

fs.writeFileSync(file, txt);
console.log('Fixed buttons string!');
