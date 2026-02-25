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
            'email'          => 'admin@bloom.ma',
            'password'       => Hash::make('Bloom@2025!'),
            'remember_token' => null,
        ]);
    }
}
