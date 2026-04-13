const fs = require('fs');
const path = require('path');

// Read both files
const productsPath = 'backend/database/seeders/products.json';
const optimizedPath = 'backend/database/seeders/products_seo_optimized_complete.json';

// Read the original products file
const originalData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

// Read the optimized products file
const optimizedData = JSON.parse(fs.readFileSync(optimizedPath, 'utf8'));

// Create a map of optimized products by name for quick lookup
const optimizedMap = {};
optimizedData.catalog.products.forEach(product => {
  const key = product.name;
  if (!optimizedMap[key]) {
    optimizedMap[key] = [];
  }
  optimizedMap[key].push(product);
});

// Track replacement statistics
let replacedCount = 0;
let totalProducts = 0;
let unmatchedProducts = [];

// Replace descriptions in original products
originalData.catalog.products.forEach(product => {
  totalProducts++;
  const productName = product.name;
  
  if (optimizedMap[productName]) {
    // Find the matching product in optimized list by type_produit
    const optimizedProduct = optimizedMap[productName].find(
      op => op.type_produit === product.type_produit
    );
    
    if (optimizedProduct) {
      // Replace the description
      product.description = optimizedProduct.description;
      replacedCount++;
      console.log(`✓ Replaced: ${productName} (${product.type_produit})`);
    } else {
      // If no exact match by type, use the first one
      product.description = optimizedMap[productName][0].description;
      replacedCount++;
      console.log(`⚠ Replaced with fallback: ${productName} (${product.type_produit})`);
    }
  } else {
    unmatchedProducts.push({
      id: product.id,
      name: productName,
      type: product.type_produit
    });
    console.log(`✗ No match found: ${productName} (${product.type_produit})`);
  }
});

// Write the updated products back to the file
fs.writeFileSync(productsPath, JSON.stringify(originalData, null, 2), 'utf8');

// Print summary
console.log('\n========== REPLACEMENT SUMMARY ==========');
console.log(`Total products processed: ${totalProducts}`);
console.log(`Successfully replaced: ${replacedCount}`);
console.log(`Unmatched products: ${unmatchedProducts.length}`);

if (unmatchedProducts.length > 0) {
  console.log('\nUnmatched products:');
  unmatchedProducts.forEach(p => {
    console.log(`  - ID ${p.id}: ${p.name} (${p.type})`);
  });
}

console.log('\n✓ File updated successfully: backend/database/seeders/products.json');
