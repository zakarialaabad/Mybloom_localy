const fs = require('fs');

// Read both JSON files with absolute paths
const mybloomPath = 'C:\\Users\\acer\\Desktop\\Parfum\\backend\\database\\seeders\\Mybloom2_updated (2).json';
const productsPath = 'C:\\Users\\acer\\Desktop\\Parfum\\backend\\database\\seeders\\products.json';

try {
  const mybloomData = JSON.parse(fs.readFileSync(mybloomPath, 'utf8'));
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Merge products
const newProducts = mybloomData.products;
productsData.catalog.products = productsData.catalog.products.concat(newProducts);

// Update total count
productsData.catalog.total_products = productsData.catalog.products.length;

// Write back with proper formatting
fs.writeFileSync(productsPath, JSON.stringify(productsData, null, 4), 'utf8');

console.log(`✓ Successfully merged ${newProducts.length} products from Mybloom2_updated (2).json`);
console.log(`✓ Total products in catalog: ${productsData.catalog.products.length}`);
} catch (error) {
  console.error('Error:', error.message);
  process.exit(1);
}
