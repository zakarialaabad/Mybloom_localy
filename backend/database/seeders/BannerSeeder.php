<?php

namespace Database\Seeders;

use App\Models\Banner;
use App\Services\ImageService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

class BannerSeeder extends Seeder
{
    public function run(): void
    {
        $imageService = app(ImageService::class);
        $publicImageDir = base_path('../frontend/Public/public_Image');

        $banners = [
            ['title' => 'MyBloom Special Collection', 'image' => 'Mybloom.jpg', 'type' => 'homepage_slot', 'collection_id' => null, 'position' => 1, 'link' => '/collection', 'is_active' => true],
            ['title' => 'Premium Perfumes', 'image' => 'Gemini_Generated_Image_hrmrnghrmrnghrmr@2x.jpg', 'type' => 'homepage_slot', 'collection_id' => 1, 'position' => 2, 'link' => '/collection?category=parfums', 'is_active' => true],
            ['title' => 'Body Care Excellence', 'image' => 'Gemini_Generated_Image_kjemuakjemuakjem.jpg', 'type' => 'homepage_slot', 'collection_id' => 2, 'position' => 3, 'link' => '/collection?category=soins-du-corps', 'is_active' => true],
            ['title' => 'Fast & Secure Delivery', 'image' => 'bloomDelivere.jpg', 'type' => 'homepage_slot', 'collection_id' => null, 'position' => 4, 'link' => null, 'is_active' => true],
            ['title' => 'New Arrivals', 'image' => 'Gemini_Generated_Image_oceudqoceudqoceu.jpg', 'type' => 'homepage_slot', 'collection_id' => 3, 'position' => 5, 'link' => '/collection?category=nouveautes', 'is_active' => true],
            ['title' => 'Explore All Products', 'image' => 'Gemini_Generated_Image_1el1is1el1is1el1.jpg', 'type' => 'collection_hero', 'collection_id' => null, 'position' => 1, 'link' => null, 'is_active' => true],
            ['title' => 'Parfums Collection', 'image' => 'Gemini_Generated_Image_3524az3524az3524.jpg', 'type' => 'collection_hero', 'collection_id' => 1, 'position' => 1, 'link' => null, 'is_active' => true],
            ['title' => 'Body Care Essentials', 'image' => 'Gemini_Generated_Image_y9e7hry9e7hry9e7 (1).jpg', 'type' => 'collection_hero', 'collection_id' => 2, 'position' => 1, 'link' => null, 'is_active' => true],
            ['title' => 'Our Packaging', 'image' => 'order_packaging.jpg', 'type' => 'homepage_slot', 'collection_id' => null, 'position' => 6, 'link' => null, 'is_active' => true],
        ];

        foreach ($banners as $banner) {
            $imagePath = $publicImageDir . DIRECTORY_SEPARATOR . $banner['image'];
            $storedPath = '/public_Image/' . $banner['image']; // fallback

            if (file_exists($imagePath)) {
                try {
                    $result = $imageService->process($imagePath, 'banners');
                    $storedPath = $result->relativePath;
                } catch (\Exception $e) {
                    Log::warning("BannerSeeder: Failed to process {$banner['image']}: {$e->getMessage()}");
                }
            }

            Banner::create([
                'title'         => $banner['title'],
                'image_path'    => $storedPath,
                'type'          => $banner['type'],
                'collection_id' => $banner['collection_id'],
                'position'      => $banner['position'],
                'link'          => $banner['link'],
                'is_active'     => $banner['is_active'],
            ]);
        }
    }
}
