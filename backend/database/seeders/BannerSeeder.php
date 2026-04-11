<?php

namespace Database\Seeders;

use App\Models\Banner;
use Illuminate\Database\Seeder;

class BannerSeeder extends Seeder
{
    /**
     * Seed the banners table with all existing banners.
     * 
     * Banners include:
     * - Homepage slots (carousel/hero sections)
     * - Collection hero images (for /collection pages)
     */
    public function run(): void
    {
        // ── Homepage Banners (hero section at top of homepage) ─────────────────

        Banner::create([
            'title'         => 'MyBloom Special Collection',
            'image_path'    => '/public_Image/Mybloom.jpg',
            'type'          => 'homepage_slot',
            'collection_id' => null,
            'position'      => 1,
            'link'          => '/collection',
            'is_active'     => true,
        ]);

        Banner::create([
            'title'         => 'Premium Perfumes',
            'image_path'    => '/public_Image/Gemini_Generated_Image_hrmrnghrmrnghrmr@2x.jpg',
            'type'          => 'homepage_slot',
            'collection_id' => 1, // Parfums
            'position'      => 2,
            'link'          => '/collection?category=parfums',
            'is_active'     => true,
        ]);

        Banner::create([
            'title'         => 'Body Care Excellence',
            'image_path'    => '/public_Image/Gemini_Generated_Image_kjemuakjemuakjem.jpg',
            'type'          => 'homepage_slot',
            'collection_id' => 2, // Soins du Corps
            'position'      => 3,
            'link'          => '/collection?category=soins-du-corps',
            'is_active'     => true,
        ]);

        Banner::create([
            'title'         => 'Fast & Secure Delivery',
            'image_path'    => '/public_Image/bloomDelivere.jpg',
            'type'          => 'homepage_slot',
            'collection_id' => null,
            'position'      => 4,
            'link'          => null,
            'is_active'     => true,
        ]);

        Banner::create([
            'title'         => 'New Arrivals',
            'image_path'    => '/public_Image/Gemini_Generated_Image_oceudqoceudqoceu.jpg',
            'type'          => 'homepage_slot',
            'collection_id' => 3, // Nouveautés
            'position'      => 5,
            'link'          => '/collection?category=nouveautes',
            'is_active'     => true,
        ]);

        // ── Collection Hero Banners (hero section for /collection page) ─────────

        Banner::create([
            'title'         => 'Explore All Products',
            'image_path'    => '/public_Image/Gemini_Generated_Image_1el1is1el1is1el1.jpg',
            'type'          => 'collection_hero',
            'collection_id' => null, // Used as default collection hero
            'position'      => 1,
            'link'          => null,
            'is_active'     => true,
        ]);

        Banner::create([
            'title'         => 'Parfums Collection',
            'image_path'    => '/public_Image/Gemini_Generated_Image_3524az3524az3524.jpg',
            'type'          => 'collection_hero',
            'collection_id' => 1, // Parfums
            'position'      => 1,
            'link'          => null,
            'is_active'     => true,
        ]);

        Banner::create([
            'title'         => 'Body Care Essentials',
            'image_path'    => '/public_Image/Gemini_Generated_Image_y9e7hry9e7hry9e7 (1).jpg',
            'type'          => 'collection_hero',
            'collection_id' => 2, // Soins du Corps
            'position'      => 1,
            'link'          => null,
            'is_active'     => true,
        ]);

        Banner::create([
            'title'         => 'Our Packaging',
            'image_path'    => '/public_Image/order_packaging.jpg',
            'type'          => 'homepage_slot',
            'collection_id' => null,
            'position'      => 6,
            'link'          => null,
            'is_active'     => true,
        ]);
    }
}
