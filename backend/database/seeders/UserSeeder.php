<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // Admin account
        User::firstOrCreate(
            ['email' => 'admin@parfum.test'],
            [
                'name'              => 'Admin User',
                'password'          => Hash::make('Password1!'),
                'role'              => 'admin',
                'email_verified_at' => now(),
            ],
        );

        // Sample customer accounts
        User::factory(10)->create(['role' => 'customer']);

        $this->command->info('Users seeded.');
    }
}
