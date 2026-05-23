<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            ['name_en' => 'Appetizers', 'name_my' => 'အစာဦး', 'sort_order' => 1],
            ['name_en' => 'Main Course', 'name_my' => 'အဓိကအစာ', 'sort_order' => 2],
            ['name_en' => 'Drinks', 'name_my' => 'သောက်ဖွယ်', 'sort_order' => 3],
            ['name_en' => 'Desserts', 'name_my' => 'မုန့်ဟင်းခါး', 'sort_order' => 4],
        ];

        foreach ($categories as $cat) {
            Category::create($cat);
        }
    }
}
