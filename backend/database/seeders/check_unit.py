import json

with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

# Vérifier le premier produit et sa première variante
first_product = data['catalog']['products'][0]
print(f"Produit: {first_product['name']}")
print(f"Catégorie: {first_product['category']}")
if first_product.get('variants'):
    first_variant = first_product['variants'][0]
    print(f"\nPremière variante:")
    print(json.dumps(first_variant, indent=2, ensure_ascii=False))
else:
    print("Pas de variantes")
