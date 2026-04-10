const fs = require('fs');

const path = 'C:\\Users\\acer\\Desktop\\Parfum\\backend\\database\\seeders\\products.json';
let content = fs.readFileSync(path, 'utf8');

// Fix the Mybloom image paths by replacing all occurrences
const fixed = content.split('"img_main": "mybloom parfum/').join('"img_main": "/images/mybloom parfum/');

// Also fix the database copy
fs.writeFileSync(path, fixed, 'utf8');
fs.writeFileSync('C:\\Users\\acer\\Desktop\\Parfum\\backend\\database\\products.json', fixed, 'utf8');

// Count the fixes
const mybloomFixed = (fixed.match(/\"\/images\/mybloom parfum\//g) || []).length;
const stillBroken = (fixed.match(/\"mybloom parfum\//g) || []).length;

console.log('✓ Image path fix completed');
console.log('  - Mybloom images fixed: ' + mybloomFixed);
console.log('  - Still broken: ' + stillBroken);
console.log('✓ Files updated: seeders/products.json and database/products.json');
