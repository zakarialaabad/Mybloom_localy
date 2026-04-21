import json

# Charger le fichier JSON
with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Définir les nouvelles variantes
new_variants = [
    {
        "size": 20,
        "price": 50,
        "final_price": 50,
        "original_price": None,
        "promotion_percent": 0,
        "stock_quantity": 50,
        "unit": "ml"
    },
    {
        "size": 50,
        "price": 70,
        "final_price": 70,
        "original_price": None,
        "promotion_percent": 0,
        "stock_quantity": 50,
        "unit": "ml"
    }
]

# Compteurs
modified_count = 0
skipped_bloom = 0
skipped_other_category = 0

# Parcourir les produits
for product in data['catalog']['products']:
    category = product.get('category', '').lower().strip()
    brand = product.get('brand', '')
    
    # Vérifier les conditions
    if category == 'parfum' and brand != 'My Bloom':
        # Modifier les variantes
        product['variants'] = new_variants
        modified_count += 1
        print(f"✓ Modifié: {product['name']} ({brand})")
    elif category == 'parfum' and brand == 'My Bloom':
        skipped_bloom += 1
    elif category != 'parfum':
        skipped_other_category += 1

# Sauvegarder le fichier
with open('products.json', 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=4)

print(f"\n📊 RÉSUMÉ:")
print(f"✅ Produits modifiés: {modified_count}")
print(f"⏭️  Ignorés (My Bloom): {skipped_bloom}")
print(f"⏭️  Ignorés (autre catégorie): {skipped_other_category}")
print(f"📦 Total produits: {len(data['catalog']['products'])}")
