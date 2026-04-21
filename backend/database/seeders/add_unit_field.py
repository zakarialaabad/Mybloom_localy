import json

# Lire le fichier products.json
with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Parcourir tous les produits et ajouter le champ unit
count_modified = 0
for product in data['catalog']['products']:
    category = product.get('category', '').lower().strip()
    
    # Déterminer l'unité selon la catégorie
    unit = 'g' if category in ['gommage', 'beurre'] else 'ml'
    
    # Ajouter le champ unit à chaque variante
    if 'variants' in product and isinstance(product['variants'], list):
        for variant in product['variants']:
            variant['unit'] = unit
            count_modified += 1

# Sauvegarder le fichier modifié
with open('products.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print(f"✅ {count_modified} variantes modifiées avec le champ 'unit'")
print(f"📦 Total produits: {len(data['catalog']['products'])}")

# Afficher quelques exemples
print("\n📋 Exemples:")
for i, product in enumerate(data['catalog']['products'][:5]):
    if product.get('variants'):
        print(f"  - {product['name']} ({product.get('category')}) => unit: {product['variants'][0].get('unit')}")
