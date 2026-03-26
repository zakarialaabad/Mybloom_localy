const fs = require('fs');

const processProductForm = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add errors state
  if (!content.includes('const [errors, setErrors] = useState')) {
    content = content.replace(
      /const \[formData, setFormData\] = useState/g,
      "const [errors, setErrors] = useState<Record<string, string>>({});\n  const [formData, setFormData] = useState"
    );
  }

  // Handle JSON errors on submit
  if (content.match(/if \(!res\.ok\) \{[\s\S]*?console\.error\('Validation Errors:', jsonData\);[\s\S]*?showToast/)) {
    content = content.replace(
      /if \(!res\.ok\) \{[\s\S]*?console\.error\('Validation Errors:', jsonData\);[\s\S]*?showToast\('Failed to save product\..*?'\);\s*return;\s*\}/g,
      `if (!res.ok) {
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
      } else {
        setErrors({});
      }`
    );
  }

  // Clear errors when typing in main fields
  const addErrorReset = (match, t) => {
    if (t.includes('setErrors')) return match;
    return match.replace(/onChange={([^}]+)}/, 'onChange={(e) => { setErrors(prev => ({...prev, ' + t + ': \'\'})); $1 }}');
  };

  // Add Error components below labels or inputs
  const errorComp = (key) => `{errors.${key} && <p className="text-red-500 text-xs mt-1 font-semibold animate-pulse">{errors.${key}}</p>}`;

  const replaceInput = (nameAttr, formField) => {
    const rx = new RegExp(`(<input[^>]*name="${nameAttr}"[^>]*)(>)`, 'g');
    content = content.replace(rx, (m, p1, p2) => {
      if (m.includes('onChange')) return m; // simplified
      return `${p1} onChange={(e) => { setFormData({...formData, ${formField}: e.target.value}); setErrors(prev => ({...prev, ${nameAttr}: ''})) }} ${p2}`;
    });
    // Add error component after the input based on wrapper divs
    const rxWrap = new RegExp(`(<div className="space-y-4">\\s*<label[^>]*>${formField}<\\/label>\\s*)((?:<input|<textarea|<select)[\\s\\S]*?<\\/(?:input|textarea|select)>|<input[^>]*\\/>)`, 'ig');
    // It's getting complicated to regex raw HTML layout reliably. Let's do simple replaces.
  };

  // Simplified Error placement for known fields:
  const injectError = (content, fieldName, errorKey) => {
    const searchStrArr = [
      `name="${fieldName}"`,
    ];
    let newContent = content;
    // Let's just find the closing tag or self-closing tag for the input/select/textarea and append the error block
    // Specifically looking for the form blocks
    const regex = new RegExp(`(name="${fieldName}"[\\s\\S]*?(?:<\\/input>|<\\/select>|<\\/textarea>|\\/>))`, 'g');
    if (!newContent.includes(`errors.${errorKey}`)) {
        newContent = newContent.replace(regex, `$1\n              {errors.${errorKey} && <span className="text-red-500 text-[12px] font-bold mt-1 block">{errors.${errorKey}}</span>}`);
    }
    // Also inject onChange clear
    const rxChange = new RegExp(`(name="${fieldName}"[^>]+onChange=\\{e => setFormData\\(\\{ \\.\\.\\.formData, ${fieldName}: e\\.target\\.value \\}\\)\\})`, 'g');
    newContent = newContent.replace(rxChange, `name="${fieldName}" onChange={e => { setFormData({ ...formData, ${fieldName}: e.target.value }); setErrors(prev => ({...prev, ${errorKey}: ''})); }}`);
    
    return newContent;
  };

  content = injectError(content, 'name', 'name');
  content = injectError(content, 'short_description', 'subtitle'); // Backend uses subtitle
  content = injectError(content, 'full_description', 'description'); // Backend uses description
  content = injectError(content, 'category_id', 'category_id');
  content = injectError(content, 'brand_id', 'brand_id');

  fs.writeFileSync(filePath, content, 'utf8');
};

const processCouponForm = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');

  // Add errors state
  if (!content.includes('const [errors, setErrors] = useState')) {
    content = content.replace(
      /const \[formData, setFormData\] = useState/g,
      "const [errors, setErrors] = useState<Record<string, string>>({});\n  const [formData, setFormData] = useState"
    );
  }

  // Handle JSON errors on submit
  if (content.match(/if \(!res\.ok\) \{[\s\S]*?showToast\('Failed/)) {
    content = content.replace(
      /if \(!res\.ok\) \{[\s\S]*?showToast\('Failed.*?'\);\s*return;\s*\}/g,
      `if (!res.ok) {
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
      } else {
        setErrors({});
      }`
    );
  }

  const injectError = (content, formKey, errorKey) => {
    const rx = new RegExp(`(value=\\{formData\\.${formKey}\\}[\\s\\S]*?(?:<\\/input>|<\\/select>|<\\/textarea>|\\/>))`, 'g');
    if (!content.includes(`errors.${errorKey}`)) {
        content = content.replace(rx, `$1\n                {errors.${errorKey} && <span className="text-red-500 text-[12px] font-bold mt-1 block px-2">{errors.${errorKey}}</span>}`);
    }
    const rxChange = new RegExp(`(onChange=\\{e => setFormData\\(\\{ \\.\\.\\.formData, ${formKey}: e\\.target\\.value \\}\\)\\})`, 'g');
    content = content.replace(rxChange, `onChange={e => { setFormData({ ...formData, ${formKey}: e.target.value }); setErrors(prev => ({...prev, ${errorKey}: ''})); }}`);
    return content;
  };

  content = injectError(content, 'code', 'code');
  content = injectError(content, 'type', 'type');
  content = injectError(content, 'value', 'value');
  content = injectError(content, 'min_order_amount', 'min_order_amount');
  content = injectError(content, 'usage_limit', 'usage_limit');
  content = injectError(content, 'expires_at', 'expires_at');

  fs.writeFileSync(filePath, content, 'utf8');
};

processProductForm('frontend/app/admin/dashboard/products/add/page.tsx');
processProductForm('frontend/app/admin/dashboard/products/[id]/edit/page.tsx');

processCouponForm('frontend/app/admin/dashboard/coupons/create/page.tsx');
processCouponForm('frontend/app/admin/dashboard/coupons/[id]/edit/page.tsx');

console.log("Validation fix script complete.");
