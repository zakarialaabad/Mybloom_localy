<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ReviewSeeder extends Seeder
{
    public function run(): void
    {
        $approved = now();

        DB::table('reviews')->insert([

            // ══ APPROVED REVIEWS (28) ════════════════════════════════════════

            // Product 1 — Over Dose (6 approved)
            ['id' =>  1, 'product_id' => 1, 'order_number' => 'BL-TEST-001', 'reviewer_name' => 'Fatima Zahra',   'rating' => 5, 'body' => 'واعرة بزاف ريحتها تنبهر 😍 شكرا بلوم',                          'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2025-12-06 10:00:00', 'updated_at' => $approved],
            ['id' =>  2, 'product_id' => 1, 'order_number' => 'BL-TEST-009', 'reviewer_name' => 'Houda M.',       'rating' => 5, 'body' => 'ريحة رائعة، تدوم طويل جداً. أنصح بها بشدة 💕',                'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2025-12-22 09:00:00', 'updated_at' => $approved],
            ['id' =>  3, 'product_id' => 1, 'order_number' => null,          'reviewer_name' => 'Aicha B.',       'rating' => 4, 'body' => 'Très bonne qualité, je la rachèterai sans hésiter.',           'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-05 14:00:00', 'updated_at' => $approved],
            ['id' =>  4, 'product_id' => 1, 'order_number' => null,          'reviewer_name' => 'Khadija R.',     'rating' => 5, 'body' => 'من أفضل برفانات اللي جربتها. الريحة تدوم نهار كامل.',        'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-12 11:00:00', 'updated_at' => $approved],
            ['id' =>  5, 'product_id' => 1, 'order_number' => null,          'reviewer_name' => 'Meryem T.',      'rating' => 4, 'body' => 'Packaging magnifique et odeur envoûtante. Très satisfaite.',   'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-20 16:00:00', 'updated_at' => $approved],
            ['id' =>  6, 'product_id' => 1, 'order_number' => null,          'reviewer_name' => 'Sara El A.',     'rating' => 3, 'body' => 'Belle odeur mais la tenue aurait pu être meilleure.',          'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-01 08:00:00', 'updated_at' => $approved],

            // Product 2 — Sugar Pop (6 approved)
            ['id' =>  7, 'product_id' => 2, 'order_number' => 'BL-TEST-003', 'reviewer_name' => 'Nadia Benali',  'rating' => 5, 'body' => 'هاد الكريم خير من رأيت في حياتي، رائحة لحلوة وبشرة ناعمة',   'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2025-12-12 10:00:00', 'updated_at' => $approved],
            ['id' =>  8, 'product_id' => 2, 'order_number' => null,          'reviewer_name' => 'Sara K.',       'rating' => 4, 'body' => 'Bonne texture, s\'absorbe bien. Odeur sucrée très agréable.',   'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-03 12:00:00', 'updated_at' => $approved],
            ['id' =>  9, 'product_id' => 2, 'order_number' => null,          'reviewer_name' => 'Widad F.',      'rating' => 5, 'body' => 'Peau toute douce après application. Je suis fan !',             'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-15 09:00:00', 'updated_at' => $approved],
            ['id' => 10, 'product_id' => 2, 'order_number' => null,          'reviewer_name' => 'Loubna H.',     'rating' => 4, 'body' => 'Excellent rapport qualité/prix. Très nourrissant.',              'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-28 14:00:00', 'updated_at' => $approved],
            ['id' => 11, 'product_id' => 2, 'order_number' => null,          'reviewer_name' => 'Zineb A.',      'rating' => 5, 'body' => 'Le meilleur body butter du marché marocain.',                  'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-05 11:00:00', 'updated_at' => $approved],
            ['id' => 12, 'product_id' => 2, 'order_number' => null,          'reviewer_name' => 'Hind O.',       'rating' => 3, 'body' => 'Correct, mais un peu cher pour la quantité.',                   'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-10 08:00:00', 'updated_at' => $approved],

            // Product 3 — Velvet Noir (4 approved)
            ['id' => 13, 'product_id' => 3, 'order_number' => null,          'reviewer_name' => 'Mohammed A.',   'rating' => 5, 'body' => 'Parfum sophistiqué, tient toute la journée sans problème.',     'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-08 13:00:00', 'updated_at' => $approved],
            ['id' => 14, 'product_id' => 3, 'order_number' => null,          'reviewer_name' => 'Karim T.',      'rating' => 4, 'body' => 'De très bonne qualité. Belle bouteille, beau parfum.',          'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-18 10:00:00', 'updated_at' => $approved],
            ['id' => 15, 'product_id' => 3, 'order_number' => null,          'reviewer_name' => 'Yacine M.',     'rating' => 5, 'body' => 'Velvet Noir c\'est de la classe pure. Sillage incroyable.',     'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-02 09:00:00', 'updated_at' => $approved],
            ['id' => 16, 'product_id' => 3, 'order_number' => null,          'reviewer_name' => 'Omar B.',       'rating' => 4, 'body' => 'Très bon parfum unisexe, convient à toute occasion.',           'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-14 15:00:00', 'updated_at' => $approved],

            // Product 4 — Atlas Rose (4 approved)
            ['id' => 17, 'product_id' => 4, 'order_number' => 'BL-TEST-003', 'reviewer_name' => 'Nadia B.',      'rating' => 5, 'body' => 'Atlas Rose est magnifique ! Rose et oud réunis à la perfection.','is_approved' => true, 'approved_at' => $approved, 'created_at' => '2025-12-12 11:00:00', 'updated_at' => $approved],
            ['id' => 18, 'product_id' => 4, 'order_number' => null,          'reviewer_name' => 'Imane L.',      'rating' => 5, 'body' => 'Mon parfum préféré Bloom jusqu\'à présent. Élégant et féminin.',  'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-10 14:00:00', 'updated_at' => $approved],
            ['id' => 19, 'product_id' => 4, 'order_number' => null,          'reviewer_name' => 'Salma K.',      'rating' => 4, 'body' => 'Belle fragrance florale, parfaite pour la journée.',             'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-25 09:00:00', 'updated_at' => $approved],
            ['id' => 20, 'product_id' => 4, 'order_number' => null,          'reviewer_name' => 'Hajar M.',      'rating' => 3, 'body' => 'Bonne odeur mais la tenue est moins longue qu\'espéré.',         'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-08 10:00:00', 'updated_at' => $approved],

            // Product 5 — Bois du Sahara (4 approved)
            ['id' => 21, 'product_id' => 5, 'order_number' => 'BL-TEST-014', 'reviewer_name' => 'Hamid L.',      'rating' => 5, 'body' => 'Bois du Sahara — قوي وعريق كالصحراء. أحسن برفان رجالي',         'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-23 10:00:00', 'updated_at' => $approved],
            ['id' => 22, 'product_id' => 5, 'order_number' => null,          'reviewer_name' => 'Yassen R.',     'rating' => 4, 'body' => 'Parfum masculin raffiné, pas trop lourd. Très agréable.',        'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-22 08:00:00', 'updated_at' => $approved],
            ['id' => 23, 'product_id' => 5, 'order_number' => null,          'reviewer_name' => 'Adil F.',       'rating' => 5, 'body' => 'ريحة صحراوية ما كاينة حتى واحدة. المنتج أزيان بزاف.',          'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-01 12:00:00', 'updated_at' => $approved],
            ['id' => 24, 'product_id' => 5, 'order_number' => null,          'reviewer_name' => 'Tarek B.',      'rating' => 4, 'body' => 'Boisé, chaud et persistant. Mon nouveau parfum préféré.',        'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-18 16:00:00', 'updated_at' => $approved],

            // Products 6–10 (sampler)
            ['id' => 25, 'product_id' => 6,  'order_number' => null, 'reviewer_name' => 'Salma O.',   'rating' => 3, 'body' => 'Odeur sympa mais ne dure pas assez.',               'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-01-30 11:00:00', 'updated_at' => $approved],
            ['id' => 26, 'product_id' => 7,  'order_number' => null, 'reviewer_name' => 'Hiba F.',    'rating' => 5, 'body' => 'Ambre Royal, tout est dit. Une fragrance sublime.',  'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-03 09:00:00', 'updated_at' => $approved],
            ['id' => 27, 'product_id' => 8,  'order_number' => null, 'reviewer_name' => 'Malak B.',   'rating' => 5, 'body' => 'Jasmine Night ريحتها بحال الجنة في الليل 🌸',        'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-07 14:00:00', 'updated_at' => $approved],
            ['id' => 28, 'product_id' => 10, 'order_number' => null, 'reviewer_name' => 'Siham K.',   'rating' => 4, 'body' => 'Body butter super nourrissant, peau de bébé après.',  'is_approved' => true, 'approved_at' => $approved, 'created_at' => '2026-02-15 10:00:00', 'updated_at' => $approved],

            // ══ PENDING REVIEWS (12 — admin moderation queue) ════════════════

            ['id' => 29, 'product_id' => 1,  'order_number' => null,          'reviewer_name' => 'Client Anonyme', 'rating' => 2, 'body' => 'Pas convaincu, la livraison a pris trop longtemps.',        'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-24 08:00:00', 'updated_at' => '2026-02-24 08:00:00'],
            ['id' => 30, 'product_id' => 2,  'order_number' => null,          'reviewer_name' => 'Utilisateur 30', 'rating' => 5, 'body' => 'Absolument parfait ! Je recommande vivement.',             'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-24 09:00:00', 'updated_at' => '2026-02-24 09:00:00'],
            ['id' => 31, 'product_id' => 3,  'order_number' => null,          'reviewer_name' => 'Nouveau Client', 'rating' => 4, 'body' => 'Très bonne qualité pour le prix.',                         'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-24 10:00:00', 'updated_at' => '2026-02-24 10:00:00'],
            ['id' => 32, 'product_id' => 4,  'order_number' => null,          'reviewer_name' => 'Amina Z.',       'rating' => 5, 'body' => 'Fragrance florale délicieuse, je l\'ai offert à ma mère.', 'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-24 11:00:00', 'updated_at' => '2026-02-24 11:00:00'],
            ['id' => 33, 'product_id' => 5,  'order_number' => null,          'reviewer_name' => 'Driss M.',       'rating' => 4, 'body' => 'Très masculin et raffiné. Ma femme l\'adore sur moi.',     'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-24 12:00:00', 'updated_at' => '2026-02-24 12:00:00'],
            ['id' => 34, 'product_id' => 6,  'order_number' => null,          'reviewer_name' => 'Asmaa L.',       'rating' => 4, 'body' => 'Cactus Flower est rafraîchissant, idéal pour l\'été.',    'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-24 13:00:00', 'updated_at' => '2026-02-24 13:00:00'],
            ['id' => 35, 'product_id' => 7,  'order_number' => null,          'reviewer_name' => 'Rachid K.',      'rating' => 2, 'body' => 'Trop fort pour moi personnellement.',                       'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-24 14:00:00', 'updated_at' => '2026-02-24 14:00:00'],
            ['id' => 36, 'product_id' => 8,  'order_number' => null,          'reviewer_name' => 'Fatima H.',      'rating' => 5, 'body' => 'Parfum de nuit magistral, je l\'adore.',                   'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-25 07:00:00', 'updated_at' => '2026-02-25 07:00:00'],
            ['id' => 37, 'product_id' => 9,  'order_number' => null,          'reviewer_name' => 'Mouad R.',       'rating' => 3, 'body' => 'Correct pour le sport mais pas exceptionnel.',              'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-25 07:30:00', 'updated_at' => '2026-02-25 07:30:00'],
            ['id' => 38, 'product_id' => 10, 'order_number' => null,          'reviewer_name' => 'Btissam A.',     'rating' => 5, 'body' => 'Nude Rose c\'est divin. Peau soyeuse garantie.',           'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-25 08:00:00', 'updated_at' => '2026-02-25 08:00:00'],
            ['id' => 39, 'product_id' => 11, 'order_number' => null,          'reviewer_name' => 'Soumaya D.',     'rating' => 1, 'body' => 'Pas le vrai Chanel, déçue.',                               'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-25 08:30:00', 'updated_at' => '2026-02-25 08:30:00'],
            ['id' => 40, 'product_id' => 12, 'order_number' => null,          'reviewer_name' => 'Latifa M.',      'rating' => 5, 'body' => 'Miss Dior, intemporel et magnifique.',                      'is_approved' => false, 'approved_at' => null, 'created_at' => '2026-02-25 09:00:00', 'updated_at' => '2026-02-25 09:00:00'],
        ]);
    }
}
