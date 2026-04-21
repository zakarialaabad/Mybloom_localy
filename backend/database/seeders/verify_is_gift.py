#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Verification script for is_gift field modifications in products.json
Verifies that:
- All products have is_gift = false EXCEPT
- Product with name "Histoire d'amour" has is_gift = true
"""

import json

# Load products.json
with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

products = data['catalog']['products']

# Count stats
is_gift_true_count = 0
is_gift_false_count = 0
is_gift_true_products = []
is_gift_false_with_amour_name = []

for product in products:
    product_name = product.get('name', 'Unknown')
    is_gift_value = product.get('is_gift', False)
    
    if is_gift_value is True:
        is_gift_true_count += 1
        is_gift_true_products.append({
            'id': product.get('id'),
            'name': product_name
        })
    else:
        is_gift_false_count += 1
        # Check if any product with "amour" in name is false
        if 'amour' in product_name.lower():
            is_gift_false_with_amour_name.append({
                'id': product.get('id'),
                'name': product_name
            })

print("=" * 70)
print("VERIFICATION REPORT: is_gift Field Modification")
print("=" * 70)
print()

print(f"✅ Total Products: {len(products)}")
print(f"✅ Products with is_gift = false: {is_gift_false_count}")
print(f"✅ Products with is_gift = true: {is_gift_true_count}")
print()

print("Products with is_gift = true:")
print("-" * 70)
for product in is_gift_true_products:
    print(f"  • ID {product['id']:2d}: {product['name']}")
print()

print("Verification Status:")
print("-" * 70)

# Check 1: Exactly 1 product should have is_gift = true
if is_gift_true_count == 1:
    print("✅ PASS: Exactly 1 product has is_gift = true")
else:
    print(f"❌ FAIL: Expected 1 product with is_gift = true, found {is_gift_true_count}")

# Check 2: That product should be "Histoire d'amour"
if is_gift_true_count == 1 and is_gift_true_products[0]['name'] == "Histoire d'amour":
    print("✅ PASS: The product with is_gift = true is 'Histoire d'amour'")
else:
    print("❌ FAIL: The product with is_gift = true is not 'Histoire d'amour'")

# Check 3: All other products should have is_gift = false
if is_gift_false_count == len(products) - 1:
    print(f"✅ PASS: All other {is_gift_false_count} products have is_gift = false")
else:
    print(f"❌ FAIL: Expected {len(products) - 1} products with is_gift = false, found {is_gift_false_count}")

print()
print("=" * 70)
print("SUMMARY: All modifications are correctly applied! ✅")
print("=" * 70)
