const fs = require('fs');

const fixProductSubmit = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  console.log(`Fixing submit in ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace block
  const oldBlockRegex = /if \(!res\.ok\) \{[\s\S]*?showToast\('Failed to save product[^}]*return;\s*\}/;
  
  if (oldBlockRegex.test(content)) {
    content = content.replace(oldBlockRegex, `if (!res.ok) {
        if (jsonData.errors) {
          const formattedErrors: Record<string, string> = {};
          Object.keys(jsonData.errors).forEach(key => {
            formattedErrors[key] = jsonData.errors[key][0];
          });
          setErrors(formattedErrors);
          showToast('Please fix the validation errors.');
        } else {
          showToast('Failed to save product. ' + (jsonData.message || 'Please check the fields.'));
        }
        return;
      }`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated !res.ok in ${filePath}`);
  } else {
    console.log(`Could not find res.ok block in ${filePath}`);
  }
};

const fixCouponSubmit = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  console.log(`Fixing submit in ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Replace block
  const oldBlockRegex = /if \(!res\.ok\) \{[\s\S]*?showToast\('Failed to save coupon[^}]*return;\s*\}/;
  
  if (oldBlockRegex.test(content)) {
    content = content.replace(oldBlockRegex, `if (!res.ok) {
        if (jsonData.errors) {
          const formattedErrors: Record<string, string> = {};
          Object.keys(jsonData.errors).forEach(key => {
            formattedErrors[key] = jsonData.errors[key][0];
          });
          setErrors(formattedErrors);
          showToast('Please fix the validation errors.');
        } else {
          showToast('Failed to save coupon. ' + (jsonData.message || 'Please check the fields.'));
        }
        return;
      }`);
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated !res.ok in ${filePath}`);
  } else {
    console.log(`Could not find res.ok block in ${filePath}`);
  }
};

fixProductSubmit('frontend/app/admin/dashboard/products/add/page.tsx');
fixProductSubmit('frontend/app/admin/dashboard/products/[id]/edit/page.tsx');
fixCouponSubmit('frontend/app/admin/dashboard/coupons/create/page.tsx');
fixCouponSubmit('frontend/app/admin/dashboard/coupons/[id]/edit/page.tsx');
