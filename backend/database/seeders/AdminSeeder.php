<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::firstOrCreate(
            ['email' => 'Bloomparfums1@gmail.com'],
            [
                'username'       => 'loubna',
                'password'       => Hash::make('Bloom@2025!'),
                'phone'          => '+212 608656271',
                'profile_image'  => null,
                'remember_token' => null,
            ]
        );
    }
}
