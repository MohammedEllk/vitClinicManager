<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = 'admin@veteclinix.com';

        $admin = User::where('email', $email)->first();

        if (!$admin) {
            User::create([
                'name' => 'Administrateur',
                'email' => $email,
                'password' => Hash::make('admin123'), // provis
                'role' => 'admin',
            ]);

            $this->command->info('✔ Admin créé avec succès');
        } else {
            $this->command->info('ℹ Admin déjà existant');
        }
    }
}
