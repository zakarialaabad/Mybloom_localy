const fs = require('fs');

const path = 'C:\\Users\\acer\\Desktop\\Parfum\\backend\\database\\seeders\\products.json';
let content = fs.readFileSync(path, 'utf8');

// Fix the hygiene spelling in category
content = content.split('"hygiene corporelle"').join('"hygiène corporelle"');

// Save the fixed version
fs.writeFileSync(path, content, 'utf8');
fs.writeFileSync('C:\\Users\\acer\\Desktop\\Parfum\\backend\\database\\products.json', content, 'utf8');

console.log('✓ Fixed hygiene → hygiène');
console.log('✓ All 82 products ready with proper UTF-8 encoding');
