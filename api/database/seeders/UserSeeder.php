<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Owner',
            'email' => 'owner@restaurant.com',
            'password' => Hash::make('password'),
            'role' => 'owner',
        ]);

        User::create([
            'name' => 'Waiter 1',
            'email' => 'waiter@restaurant.com',
            'password' => Hash::make('password'),
            'role' => 'waiter',
        ]);

        User::create([
            'name' => 'Chef 1',
            'email' => 'chef@restaurant.com',
            'password' => Hash::make('password'),
            'role' => 'chef',
        ]);
    }
}
