<?php

namespace Database\Seeders;

use App\Models\Product;
use App\Models\ProductFaq;
use Illuminate\Database\Seeder;

class ProductFaqSeeder extends Seeder
{
    public function run(): void
    {
        $faqs = [
            [
                'question' => 'Is this product suitable for all skin types?',
                'answer'   => 'Yes, our formula is dermatologically tested and suitable for all skin types, including sensitive skin.',
            ],
            [
                'question' => 'How do I apply this fragrance?',
                'answer'   => 'Apply to pulse points such as your wrists, neck, and behind the ears for the best diffusion and longevity.',
            ],
            [
                'question' => 'How long does the scent last?',
                'answer'   => 'Typically 6–12 hours depending on your skin type, body chemistry, and environmental conditions.',
            ],
        ];

        Product::each(function (Product $product) use ($faqs) {
            // Skip products that already have FAQs seeded
            if ($product->faqs()->exists()) {
                return;
            }
            foreach ($faqs as $faq) {
                $product->faqs()->create($faq);
            }
        });
    }
}
