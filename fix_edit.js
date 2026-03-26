const fs = require('fs');
const file = 'frontend/app/admin/dashboard/products/[id]/edit/page.tsx';
let data = fs.readFileSync(file, 'utf8');

data = data.replace(
  '<div className="w-full text-left">\n          <div className="grid grid-cols-[1fr_1.2fr_1.5fr_1.5fr_1.5fr_1fr_1fr]',
  '<div className="w-full text-left overflow-x-auto no-scrollbar pb-2">\n          <div className="min-w-[900px]">\n            <div className="grid grid-cols-[1fr_1.2fr_1.5fr_1.5fr_1.5fr_1fr_1fr]'
);

data = data.replace(
  '          {variants.length === 0 && draftVariant === null && (\n            <div className="py-8 text-center text-[14px] text-gray-400 font-medium">\n              No variants yet — click &ldquo;+ Add Size Variant&rdquo; to add one.\n            </div>\n          )}\n        </div>',
  '          {variants.length === 0 && draftVariant === null && (\n            <div className="py-8 text-center text-[14px] text-gray-400 font-medium">\n              No variants yet — click &ldquo;+ Add Size Variant&rdquo; to add one.\n            </div>\n          )}\n          </div>\n        </div>'
);

fs.writeFileSync(file, data);
console.log('done');