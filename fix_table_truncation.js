const fs = require('fs');

const fixTableTextWrapping = (tableFile) => {
  if (!fs.existsSync(tableFile)) return;
  console.log(`Auditing ${tableFile}...`);
  let content = fs.readFileSync(tableFile, 'utf8');

  // In OrderTable desktop view:
  if (tableFile.includes('OrderTable.tsx')) {
    content = content.replace(
      /<div className="flex flex-col">\s*<span className="text-\[14px\] font-bold text-\[#333\]">\{order\.customer_name\}<\/span>\s*<span className="text-\[12px\] text-gray-400 mt-0\.5">\{order\.customer_phone\}<\/span>\s*<\/div>/g,
      `<div className="flex flex-col min-w-0 flex-1">
              <span className="text-[14px] font-bold text-[#333] truncate">{order.customer_name}</span>
              <span className="text-[12px] text-gray-400 mt-0.5 truncate">{order.customer_phone}</span>
            </div>`
    );
     // Order mobile view already has truncate, let's just make sure.
  }

  // In ReviewTable desktop view:
  if (tableFile.includes('ReviewTable.tsx')) {
    // Add truncate to product name
    const rxProductDesktop = /<span className="text-\[13px\] font-semibold text-gray-700 hover:text-\[#da2966\] transition-colors">\{review\.product\.name\}<\/span>/g;
    content = content.replace(rxProductDesktop, 
      `<span className="text-[13px] font-semibold text-gray-700 hover:text-[#da2966] transition-colors truncate block max-w-[200px]">{review.product.name}</span>`
    );

    // Mobile specific review product text
    const rxProductMobile = /<span className="text-\[12px\] text-gray-500 font-medium">\{review\.product\.name\}<\/span>/g;
    content = content.replace(rxProductMobile,
       `<span className="text-[12px] text-gray-500 font-medium truncate max-w-[180px]">{review.product.name}</span>`
    );
  }
  
  // CouponTable.tsx
  if (tableFile.includes('CouponTable.tsx')) {
    content = content.replace(
      /<p className="text-\[14px\] font-bold text-\[#111\] leading-tight">\{coupon\.code\}<\/p>/g,
      `<p className="text-[14px] font-bold text-[#111] leading-tight truncate max-w-[150px]">{coupon.code}</p>`
    );
  }

  fs.writeFileSync(tableFile, content, 'utf8');
};

const tables = [
  'frontend/components/OrderTable.tsx',
  'frontend/components/ProductTable.tsx',
  'frontend/components/ReviewTable.tsx',
  'frontend/components/CouponTable.tsx'
];

tables.forEach(fixTableTextWrapping);
console.log("Phase 10: Table Cell text wrapping adjustments applied.");
