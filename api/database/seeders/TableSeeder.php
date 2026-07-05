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
                // Leave label null so the UI renders a localized "Table N".
                // Only set label for genuine custom names (e.g. "Patio", "VIP").
                'label' => null,
                'capacity' => 4,
            ]);
        }
    }
}
