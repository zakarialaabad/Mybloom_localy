<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ProductTypeSeederFrench extends Seeder
{
    /**
     * Seed the product_types table with exact French types
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Corps',
                'slug' => 'corps',
            ],
            [
                'name' => 'Visage',
                'slug' => 'visage',
            ],
            [
                'name' => 'Cheveux',
                'slug' => 'cheveux',
            ],
            [
                'name' => 'Lèvres',
                'slug' => 'levres',
            ],
            [
                'name' => 'Maison',
                'slug' => 'maison',
            ],
        ];

        foreach ($types as $type) {
            // Check if product type already exists
            $existing = DB::table('product_types')
                ->where('slug', $type['slug'])
                ->first();

            if (!$existing) {
                DB::table('product_types')->insert([
                    'name' => $type['name'],
                    'slug' => $type['slug'],
                    'sort_order' => 0,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }

        $this->command->info('✅ Product Types seeded: ' . count($types));
    }
}
