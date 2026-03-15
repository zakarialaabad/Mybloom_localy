<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

/**
 * LowStockProductSeeder
 *
 * Inserts 30 fake products to exercise the virtual stock-status system:
 *   - IDs 61–80  → stock 1–7  (Low Stock  — below LOW_STOCK_THRESHOLD of 10)
 *   - IDs 81–90  → stock 0    (Inactive   — out of stock)
 */
class LowStockProductSeeder extends Seeder
{
    public function run(): void
    {
        $desc = 'Une fragrance exclusivement conçue pour sublimer votre personnalité. Notes boisées, florales et orientales se marient avec élégance pour un sillage inoubliable.';
        $ingr = 'Alcohol Denat., Aqua, Parfum (Fragrance), Benzyl Salicylate, Linalool, Limonene, Coumarin, Citronellol, Geraniol.';

        DB::table('products')->insert([

            // ═══════════════════════════════════════════════════════════════
            // LOW STOCK — 20 products, stock between 1 and 7 (IDs 61–80)
            // ═══════════════════════════════════════════════════════════════

            [
                'id' => 61, 'brand_id' => 1, 'category_id' => 4,
                'name' => 'Oud Mystère',             'slug' => 'oud-mystere',
                'subtitle' => 'Eau de Parfum Oriental',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 270.00, 'original_price' => 340.00,
                'stock' => 3, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 62, 'brand_id' => 2, 'category_id' => 5,
                'name' => 'Fleur de Coton',          'slug' => 'fleur-de-coton',
                'subtitle' => 'Brume Corporelle Légère',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 90.00, 'original_price' => 120.00,
                'stock' => 7, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 63, 'brand_id' => 3, 'category_id' => 6,
                'name' => 'Beurre Vanille',          'slug' => 'beurre-vanille',
                'subtitle' => 'Beurre Corps Gourmand',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 115.00, 'original_price' => null,
                'stock' => 5, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 64, 'brand_id' => 4, 'category_id' => 7,
                'name' => 'Cèdre Salin',             'slug' => 'cedre-salin',
                'subtitle' => 'Cologne Boisée Marine',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'men', 'price' => 195.00, 'original_price' => 250.00,
                'stock' => 2, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 65, 'brand_id' => 5, 'category_id' => 8,
                'name' => 'Iris Sauvage',            'slug' => 'iris-sauvage',
                'subtitle' => 'Eau de Toilette Florale',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 230.00, 'original_price' => null,
                'stock' => 6, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 66, 'brand_id' => 6, 'category_id' => 9,
                'name' => 'Poivre Noir Absolu',      'slug' => 'poivre-noir-absolu',
                'subtitle' => 'Parfum Épicé Intense',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'men', 'price' => 310.00, 'original_price' => 390.00,
                'stock' => 1, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 67, 'brand_id' => 7, 'category_id' => 10,
                'name' => 'Coffret Nuit Dorée',      'slug' => 'coffret-nuit-doree',
                'subtitle' => 'Coffret Cadeau Prestige',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 480.00, 'original_price' => 600.00,
                'stock' => 4, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 68, 'brand_id' => 8, 'category_id' => 11,
                'name' => 'Miel de Roses',           'slug' => 'miel-de-roses',
                'subtitle' => 'Huile Sèche Dorée',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 155.00, 'original_price' => 190.00,
                'stock' => 7, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 69, 'brand_id' => 1, 'category_id' => 12,
                'name' => 'Gommage Figue Noire',     'slug' => 'gommage-figue-noire',
                'subtitle' => 'Gommage Corps Exfoliant',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 105.00, 'original_price' => null,
                'stock' => 3, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 70, 'brand_id' => 2, 'category_id' => 4,
                'name' => 'Ambre Solaire',           'slug' => 'ambre-solaire-edp',
                'subtitle' => 'Eau de Parfum Chaud',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 265.00, 'original_price' => 330.00,
                'stock' => 6, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 71, 'brand_id' => 3, 'category_id' => 5,
                'name' => 'Vague d\'Été',            'slug' => 'vague-d-ete',
                'subtitle' => 'Brume Fraîche Solaire',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 80.00, 'original_price' => 105.00,
                'stock' => 5, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 72, 'brand_id' => 4, 'category_id' => 6,
                'name' => 'Crème Abricot Voilée',    'slug' => 'creme-abricot-voilee',
                'subtitle' => 'Crème Corps Légère',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 125.00, 'original_price' => null,
                'stock' => 2, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 73, 'brand_id' => 5, 'category_id' => 7,
                'name' => 'Cuir Tabac Noir',         'slug' => 'cuir-tabac-noir',
                'subtitle' => 'Cologne Signature Homme',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'men', 'price' => 280.00, 'original_price' => 360.00,
                'stock' => 1, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 74, 'brand_id' => 6, 'category_id' => 8,
                'name' => 'Santal Ivoire',           'slug' => 'santal-ivoire',
                'subtitle' => 'Eau de Toilette Boisée',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 215.00, 'original_price' => null,
                'stock' => 7, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 75, 'brand_id' => 7, 'category_id' => 9,
                'name' => 'Patchouli Bohème',        'slug' => 'patchouli-boheme',
                'subtitle' => 'Parfum Terreux Mystique',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 245.00, 'original_price' => 310.00,
                'stock' => 4, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 76, 'brand_id' => 8, 'category_id' => 4,
                'name' => 'Lumière Blanche',         'slug' => 'lumiere-blanche',
                'subtitle' => 'Eau de Parfum Poudré',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 255.00, 'original_price' => null,
                'stock' => 6, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 77, 'brand_id' => 1, 'category_id' => 11,
                'name' => 'Huile Précieuse Or Rose',  'slug' => 'huile-or-rose',
                'subtitle' => 'Huile Sèche Éclat',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 175.00, 'original_price' => 220.00,
                'stock' => 3, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 78, 'brand_id' => 2, 'category_id' => 12,
                'name' => 'Sel de Mer Scrub',        'slug' => 'sel-de-mer-scrub',
                'subtitle' => 'Gommage Sel Marin',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 98.00, 'original_price' => null,
                'stock' => 5, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 79, 'brand_id' => 3, 'category_id' => 10,
                'name' => 'Trio Découverte',         'slug' => 'trio-decouverte',
                'subtitle' => 'Coffret Mini Parfums',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 199.00, 'original_price' => 260.00,
                'stock' => 2, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 80, 'brand_id' => 4, 'category_id' => 4,
                'name' => 'Nuit de Grenade',         'slug' => 'nuit-de-grenade',
                'subtitle' => 'Eau de Parfum Fruité',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 235.00, 'original_price' => 295.00,
                'stock' => 7, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],

            // ═══════════════════════════════════════════════════════════════
            // OUT OF STOCK — 10 products, stock 0 (IDs 81–90)
            // ═══════════════════════════════════════════════════════════════

            [
                'id' => 81, 'brand_id' => 5, 'category_id' => 4,
                'name' => 'Encens Sacré',            'slug' => 'encens-sacre',
                'subtitle' => 'Eau de Parfum Spirituel',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 340.00, 'original_price' => null,
                'stock' => 0, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 82, 'brand_id' => 6, 'category_id' => 5,
                'name' => 'Brume Hibiscus',          'slug' => 'brume-hibiscus',
                'subtitle' => 'Brume Corps Tropicale',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 88.00, 'original_price' => 115.00,
                'stock' => 0, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 83, 'brand_id' => 7, 'category_id' => 6,
                'name' => 'Karité Royal',            'slug' => 'karite-royal',
                'subtitle' => 'Beurre Corps Beurre de Karité',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 135.00, 'original_price' => null,
                'stock' => 0, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 84, 'brand_id' => 8, 'category_id' => 7,
                'name' => 'Vétiver Élégant',         'slug' => 'vetiver-elegant',
                'subtitle' => 'Cologne Végétale Homme',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'men', 'price' => 210.00, 'original_price' => 265.00,
                'stock' => 0, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 85, 'brand_id' => 1, 'category_id' => 8,
                'name' => 'Musc Blanc Suprême',      'slug' => 'musc-blanc-supreme',
                'subtitle' => "Eau de Toilette Musc d'Exception",
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 185.00, 'original_price' => null,
                'stock' => 0, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 86, 'brand_id' => 2, 'category_id' => 9,
                'name' => 'Jasmin Étoilé',           'slug' => 'jasmin-etoile',
                'subtitle' => 'Parfum Floral de Nuit',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 295.00, 'original_price' => 380.00,
                'stock' => 0, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 87, 'brand_id' => 3, 'category_id' => 10,
                'name' => 'Coffret Évasion',         'slug' => 'coffret-evasion',
                'subtitle' => 'Coffret Voyage Premium',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 520.00, 'original_price' => 650.00,
                'stock' => 0, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 88, 'brand_id' => 4, 'category_id' => 11,
                'name' => 'Lotion Rose Veloutée',    'slug' => 'lotion-rose-veloutee',
                'subtitle' => 'Lotion Corps Rose Luxe',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'women', 'price' => 145.00, 'original_price' => null,
                'stock' => 0, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 89, 'brand_id' => 5, 'category_id' => 12,
                'name' => 'Gommage Coco Lait',       'slug' => 'gommage-coco-lait',
                'subtitle' => 'Gommage Corps Nourrissant',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 110.00, 'original_price' => 140.00,
                'stock' => 0, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
            [
                'id' => 90, 'brand_id' => 6, 'category_id' => 4,
                'name' => 'Absolu Nuit Noir',        'slug' => 'absolu-nuit-noir',
                'subtitle' => 'Eau de Parfum Edition Limitée',
                'description' => $desc, 'ingredients' => $ingr,
                'gender' => 'unisex', 'price' => 420.00, 'original_price' => 520.00,
                'stock' => 0, 'is_active' => true, 'is_featured' => false,
                'created_at' => now(), 'updated_at' => now(),
            ],
        ]);
    }
}
