<?php

namespace Database\Seeders;

use App\Models\Admin;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    public function run(): void
    {
        Admin::create([
            'username'       => 'Zakaria',
            'email'          => 'admin@bloom.ma',
            'password'       => Hash::make('Bloom@2025!'),
            'phone'          => '+212 6 11 95 50 60',
            'profile_image'  => null,
            'remember_token' => null,
        ]);
    }
}
