const fs = require('fs');
const path = 'C:\\Users\\acer\\Desktop\\Parfum\\backend\\database\\seeders\\products.json';

// Read file
let content = fs.readFileSync(path, 'utf8');

// Replace the exact mojibake patterns with correct French text
// The pattern is the literal characters: Ã¯Â¿Â½ (which becomes é when fixed)
const mojibake = 'Ã¯Â¿Â½';  // This is the corrupted sequence

const replacements = [
  ['s' + mojibake + 'r' + mojibake + 'nit' + mojibake, 'sérénité'],
  ['s' + mojibake + 'same', 'sésame'],
  ['p' + mojibake + 'pins', 'pépins'],
  ['att' + mojibake + 'nue', 'atténue'],
  ['recommand' + mojibake, 'recommandé'],
  ['destin' + mojibake, 'destiné'],
  ['r' + mojibake + 'duire', 'réduire'],
  ['ingr' + mojibake + 'dients', 'ingrédients'],
  ['fabriqu' + mojibake, 'fabriqué'],
  ['inspir' + mojibake + 'e', 'inspirée'],
  ['r' + mojibake + 'v' + mojibake + 'ler', 'révéler'],
  [mojibake + 'clatante', 'éclatante'],
  ['unifi' + mojibake + 'e', 'unifiée'],
  [mojibake + 'limine', 'élimine'],
  ['hygi' + mojibake + 'ne', 'hygiène'],
  ['pr' + mojibake + 'f' + mojibake + 'r' + mojibake, 'préféré'],
  [mojibake + 'nergie', 'énergie'],
  [mojibake + 'l' + mojibake + 'gant', 'élégant'],
  [mojibake + 'voque', 'évoque'],
  [mojibake + 'l' + mojibake + 'vation', 'élévation'],
  ['cr' + mojibake + 'ation', 'création'],
  ['acc' + mojibake + 's', 'accès'],
  ['passioncorrect' + mojibake, 'passionné'],
  ['rafin' + mojibake, 'raffiné'],
  ['s' + mojibake + 'duction', 'séduction'],
  ['d' + mojibake + 'sir', 'désir'],
  ['myst' + mojibake + 'rieux', 'mystérieux'],
  ['cr' + mojibake + 'atif', 'créatif'],
];

replacements.forEach(([corrupted, fixed]) => {
  content = content.split(corrupted).join(fixed);
});

fs.writeFileSync(path, content, 'utf8');
fs.writeFileSync('C:\\Users\\acer\\Desktop\\Parfum\\backend\\database\\products.json', content, 'utf8');

console.log('✓ All French characters fixed');



