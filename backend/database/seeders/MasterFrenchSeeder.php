<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class MasterFrenchSeeder extends Seeder
{
    /**
     * Run all French seeders together
     * 
     * This seeder runs:
     * 1. CategorySeederFrench - Seeds 5 French categories
     * 2. ProductTypeSeederFrench - Seeds 5 French product types
     * 3. IngredientSeederFrench - Seeds 14 French ingredients with images from public/ingredients
     * 
     * Usage:
     *   php artisan db:seed --class=Database\\Seeders\\MasterFrenchSeeder
     */
    public function run(): void
    {
        $this->command->info('⏳ Starting French seeders...');
        $this->command->line('');

        $this->command->info('📁 Step 1: Seeding Categories...');
        $this->call(CategorySeederFrench::class);
        $this->command->line('');

        $this->command->info('📦 Step 2: Seeding Product Types...');
        $this->call(ProductTypeSeederFrench::class);
        $this->command->line('');

        $this->command->info('🌿 Step 3: Seeding Ingredients with Images...');
        $this->call(IngredientSeederFrench::class);
        $this->command->line('');

        $this->command->info('✅ All French seeders completed successfully!');
        $this->command->line('');
        $this->command->info('📊 Summary:');
        $this->command->info('   ✓ 5 Categories');
        $this->command->info('   ✓ 5 Product Types');
        $this->command->info('   ✓ 14 Ingredients (with images)');
    }
}
