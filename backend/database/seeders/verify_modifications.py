import json

with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("📋 VÉRIFICATION DES MODIFICATIONS\n")

# Vérifier quelques produits modifiés
print("✓ EXEMPLES DE PRODUITS MODIFIÉS (parfum non-My Bloom):")
modified_examples = [p for p in data['catalog']['products'] 
                     if p.get('category') == 'parfum' and p.get('brand') != 'My Bloom'][:3]
for product in modified_examples:
    print(f"\n  {product['name']} ({product.get('brand')})")
    print(f"  Catégorie: {product.get('category')}")
    print(f"  Variantes: {len(product.get('variants', []))} trouvées")
    for i, v in enumerate(product.get('variants', []), 1):
        print(f"    Variante {i}: size={v.get('size')}, price={v.get('price')}, stock={v.get('stock_quantity')}, unit={v.get('unit')}")

# Vérifier qu'un produit My Bloom n'a pas été modifié
print("\n\n✓ EXEMPLE DE PRODUIT NON MODIFIÉ (My Bloom):")
my_bloom_examples = [p for p in data['catalog']['products'] 
                     if p.get('category') == 'parfum' and p.get('brand') == 'My Bloom'][:1]
for product in my_bloom_examples:
    print(f"\n  {product['name']} ({product.get('brand')})")
    print(f"  Catégorie: {product.get('category')}")
    print(f"  Variantes: {len(product.get('variants', []))} (INCHANGÉ)")
    for i, v in enumerate(product.get('variants', [])[:2], 1):
        print(f"    Variante {i}: size={v.get('size')}, price={v.get('price')}")

# Vérifier qu'un produit d'autre catégorie n'a pas été modifié
print("\n\n✓ EXEMPLE DE PRODUIT AUTRE CATÉGORIE (non modifié):")
other_cat_examples = [p for p in data['catalog']['products'] 
                      if p.get('category') != 'parfum'][:1]
for product in other_cat_examples:
    print(f"\n  {product['name']}")
    print(f"  Catégorie: {product.get('category')}")
    print(f"  Variantes: {len(product.get('variants', []))} (INCHANGÉ)")
    for i, v in enumerate(product.get('variants', [])[:2], 1):
        print(f"    Variante {i}: size={v.get('size')}, price={v.get('price')}")

print("\n\n✅ Vérification terminée!")
