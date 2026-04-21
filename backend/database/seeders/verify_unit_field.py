import json

with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("✅ Vérification des modifications:\n")
categories_check = {'beurre': 'g', 'gommage': 'g'}
other_cat = 'ml'

errors = 0
for product in data['catalog']['products'][:10]:
    category = product.get('category', '').lower().strip()
    if product.get('variants'):
        unit = product['variants'][0].get('unit')
        expected = categories_check.get(category, other_cat)
        status = '✓' if unit == expected else '✗'
        print(f"{status} {product['name'][:30]:30} ({category:15}) => unit: {unit} (attendu: {expected})")
        if unit != expected:
            errors += 1

if errors == 0:
    print(f"\n✅ Tous les changements sont corrects!")
else:
    print(f"\n❌ {errors} erreurs détectées")
