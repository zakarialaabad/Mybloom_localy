const fs = require('fs');

const path = 'database/seeders/products.json';
const data = JSON.parse(fs.readFileSync(path, 'utf8'));

const familyWords = {
  floral: 'Floral',
  musque: 'Musqué',
  oriental: 'Oriental',
  boise: 'Boisé',
  gourmand: 'Gourmand',
  chypre: 'Chypré',
  fruite: 'Fruité',
  aquatique: 'Aquatique',
  ambre: 'Ambré',
  aldehyde: 'Aldéhydé',
  aromatique: 'Aromatique',
  fougere: 'Fougère',
  blanc: 'Blanc',
  epice: 'Épicé',
};

function normalizeWord(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function inferType(description) {
  if (!description) return null;

  const lower = description.toLowerCase();
  const match = lower.match(/est un parfum\s+([^\.]+)/);
  if (!match) return null;

  const phrase = match[1]
    .split(' avec ses notes')[0]
    .split(' qui ')[0]
    .split(' créé')[0]
    .split(' crée')[0]
    .split(' dans ')[0]
    .replace(/[.,;:]/g, ' ');

  const tokens = phrase
    .split(/[^\p{L}]+/u)
    .map((token) => normalizeWord(token))
    .filter(Boolean);

  const found = [];
  for (const token of tokens) {
    if (familyWords[token] && !found.includes(token)) {
      found.push(token);
    }
  }

  if (found.length === 0) return null;
  return found.map((word) => familyWords[word]).join(' ');
}

let updated = 0;
const samples = [];

for (const product of data.catalog.products) {
  if (product.category === 'parfum' && product.brand && product.brand !== 'My Bloom') {
    const inferred = inferType(product.description);
    if (inferred) {
      product.type_produit = inferred;
      updated += 1;
      if (samples.length < 12) {
        samples.push(`${product.name} => ${inferred}`);
      }
    }
  }
}

fs.writeFileSync(path, JSON.stringify(data, null, 2), 'utf8');
console.log(`Updated ${updated} parfum products with inferred fragrance families.`);
for (const sample of samples) {
  console.log(sample);
}
