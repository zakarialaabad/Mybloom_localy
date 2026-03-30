<?php

namespace App\Console\Commands;

use App\Models\Product;
use Illuminate\Console\Command;

/**
 * Display Recommendation Products Count from Database
 * 
 * Usage:
 *   php artisan recommendations:count
 * 
 * This command shows:
 * - Total recommended products in database
 * - List of all recommended product IDs and names
 * - Comparison with current frontend display
 */
class RecommendationsCountCommand extends Command
{
    protected $signature = 'recommendations:count';
    protected $description = 'Display count and list of all recommended products in database';

    public function handle(): int
    {
        $this->printHeader();

        // Fetch all recommended products
        $recommendedProducts = Product::where('is_recommended', true)
            ->select('id', 'name', 'slug', 'price', 'original_price', 'is_active')
            ->orderBy('id')
            ->get();

        $count = $recommendedProducts->count();

        // Display count
        $this->newLine();
        $this->info('━━━ RECOMMENDATION COUNT: ' . $count . ' ━━━');
        
        if ($count === 0) {
            $this->warn('⚠️  No recommended products found in database!');
            return Command::FAILURE;
        }

        $this->info("✅ Found {$count} recommended products in database");
        $this->newLine();

        // Display table of products
        $this->line('<fg=cyan>RECOMMENDED PRODUCTS</>');
        $this->newLine();
        $tableData = $recommendedProducts->map(function ($product, $index) {
            return [
                '#' => $index + 1,
                'ID' => $product->id,
                'Name' => $product->name,
                'Slug' => $product->slug,
                'Price' => $product->price . ' DH',
                'Status' => $product->is_active ? '✅ Active' : '❌ Inactive',
            ];
        })->toArray();

        $this->table(
            ['#', 'ID', 'Name', 'Slug', 'Price', 'Status'],
            $tableData
        );

        // Display statistics
        $this->newLine();
        $this->line('<fg=cyan>STATISTICS</>');
        $this->newLine();
        $activeCount = $recommendedProducts->where('is_active', true)->count();
        $inactiveCount = $count - $activeCount;
        $avgPrice = $recommendedProducts->avg('price');

        $this->line("Total Recommended: <info>{$count}</info>");
        $this->line("Active: <info>{$activeCount}</info>");
        $this->line("Inactive: <comment>{$inactiveCount}</comment>");
        $this->line("Average Price: <info>" . number_format($avgPrice, 2) . " DH</info>");

        // Verification info
        $this->newLine();
        $this->line('<fg=cyan>VERIFICATION</>');
        $this->newLine();
        $this->info('To verify this count matches the frontend:');
        $this->line('1. Open product detail page');
        $this->line('2. Scroll to "You may also Like" section');
        $this->line('3. Open Browser Console (F12)');
        $this->line('4. Look for "RECOMMENDATION COUNT VERIFICATION" log');
        $this->line('5. Compare the numbers - they should match: <info>' . $count . ' products</info>');

        $this->newLine();
        $this->printFooter($count);

        return Command::SUCCESS;
    }

    private function printHeader(): void
    {
        $this->line('');
        $this->info('╔══════════════════════════════════════════════════════════════╗');
        $this->info('║          RECOMMENDATION PRODUCTS DATABASE CHECK              ║');
        $this->info('║              Product Count Verification Tool                 ║');
        $this->info('╚══════════════════════════════════════════════════════════════╝');
        $this->line('');
    }

    private function printFooter($count): void
    {
        $this->line('');
        $this->info('═══════════════════════════════════════════════════════════════');
        $this->line("<info>✅ Database contains <fg=cyan>{$count}</> recommended products</info>");
        $this->line('═══════════════════════════════════════════════════════════════');
        $this->line('');
    }
}
