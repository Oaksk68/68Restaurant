<?php

namespace Database\Seeders;

use App\Models\RestaurantTable;
use Illuminate\Database\Seeder;

class TableSeeder extends Seeder
{
    public function run(): void
    {
        for ($i = 1; $i <= 10; $i++) {
            RestaurantTable::create([
                'number' => $i,
                'label' => 'Table ' . $i,
                'capacity' => 4,
            ]);
        }
    }
}
