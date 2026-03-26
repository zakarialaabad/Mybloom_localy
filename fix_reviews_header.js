const fs = require('fs');
const file = 'frontend/app/admin/dashboard/reviews/page.tsx';
let txt = fs.readFileSync(file, 'utf8');

txt = txt.replace(
  '<div className="flex items-center gap-3 shrink-0">',
  '<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0 w-full sm:w-auto">'
);

txt = txt.replace(
  '<div className="flex items-center bg-gray-100 rounded-[10px] p-1 gap-1">',
  '<div className="flex items-center bg-gray-100 rounded-[10px] p-1 gap-1 w-full sm:w-auto">'
);

txt = txt.replace(
  /onClick=\{[^{]*setActiveView\('reviews'\)\}\n\s*className=\{\`flex/g,
  "onClick={() => setActiveView('reviews')}\n                className={`flex-1 justify-center sm:flex-none flex"
);

txt = txt.replace(
  /onClick=\{[^{]*setActiveView\('feedback'\)\}\n\s*className=\{\`flex/g,
  "onClick={() => setActiveView('feedback')}\n                className={`flex-1 justify-center sm:flex-none flex"
);

fs.writeFileSync(file, txt);
console.log('Fixed reviews header!');
