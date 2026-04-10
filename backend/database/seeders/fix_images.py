#!/usr/bin/env python3
import json

# Fix the image paths in products.json
paths = [
    'C:\\Users\\acer\\Desktop\\Parfum\\backend\\database\\seeders\\products.json',
    'C:\\Users\\acer\\Desktop\\Parfum\\backend\\database\\products.json'
]

for file_path in paths:
    try:
        # Read the JSON
        with open(file_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        # Fix image paths
        fixed_count = 0
        for product in data['catalog']['products']:
            if 'img_main' in product:
                img = product['img_main']
                # If it doesn't start with /, prepend /images/
                if not img.startswith('/'):
                    product['img_main'] = '/images/' + img
                    fixed_count += 1
        
        # Write back
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✓ Fixed {fixed_count} image paths in {file_path}")
        
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")

print("\n✓ All products.json files updated with correct image paths")
