<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Database\Seeder;

class MenuItemSeeder extends Seeder
{
    public function run(): void
    {
        $cat = Category::all()->keyBy('name_en');

        $items = [
            // Appetizers
            [
                'category_id' => $cat['Appetizers']->id,
                'name_en' => 'Spring Rolls',
                'name_my' => 'ကြော်ချောင်း',
                'description_en' => 'Crispy vegetable spring rolls',
                'description_my' => 'သာလွန် ဟင်းသီးဟင်းရွက် ကြော်ချောင်း',
                'price' => 3000,
            ],
            [
                'category_id' => $cat['Appetizers']->id,
                'name_en' => 'Soup of the Day',
                'name_my' => 'နေ့စဉ် ဟင်းရည်',
                'description_en' => "Chef's special soup",
                'description_my' => 'စားဖိုမှူး၏ အထူးဟင်းရည်',
                'price' => 2500,
            ],
            // Main Course
            [
                'category_id' => $cat['Main Course']->id,
                'name_en' => 'Chicken Fried Rice',
                'name_my' => 'ကြက်သား ကြော်ထမင်း',
                'description_en' => 'Wok-fried rice with chicken and vegetables',
                'description_my' => 'ကြက်သားနှင့် ဟင်းသီးဟင်းရွက် ကြော်ထမင်း',
                'price' => 5000,
            ],
            [
                'category_id' => $cat['Main Course']->id,
                'name_en' => 'Beef Noodles',
                'name_my' => 'အမဲသား ခေါက်ဆွဲ',
                'description_en' => 'Rich beef broth noodles',
                'description_my' => 'အမဲသား ဟင်းရည် ခေါက်ဆွဲ',
                'price' => 6000,
            ],
            [
                'category_id' => $cat['Main Course']->id,
                'name_en' => 'Grilled Fish',
                'name_my' => 'ကင်ငါး',
                'description_en' => 'Freshly grilled fish with herbs',
                'description_my' => 'ဆေးဖက်ဝင်သော အပင်များနှင့် ကင်ငါး',
                'price' => 8000,
            ],
            // Drinks
            [
                'category_id' => $cat['Drinks']->id,
                'name_en' => 'Myanmar Beer',
                'name_my' => 'မြန်မာ ဘီယာ',
                'description_en' => 'Cold Myanmar Beer',
                'description_my' => 'အေးသော မြန်မာ ဘီယာ',
                'price' => 2000,
            ],
            [
                'category_id' => $cat['Drinks']->id,
                'name_en' => 'Lime Juice',
                'name_my' => 'သံပရာ ဖျော်ရည်',
                'description_en' => 'Fresh squeezed lime juice',
                'description_my' => 'လတ်ဆတ်သော သံပရာ ဖျော်ရည်',
                'price' => 1500,
            ],
            [
                'category_id' => $cat['Drinks']->id,
                'name_en' => 'Iced Tea',
                'name_my' => 'ရေခဲလက်ဖက်ရည်',
                'description_en' => 'Burmese style iced milk tea',
                'description_my' => 'မြန်မာ ရေခဲ နို့ဖျော်လက်ဖက်ရည်',
                'price' => 1000,
            ],
            // Desserts
            [
                'category_id' => $cat['Desserts']->id,
                'name_en' => 'Mango Sticky Rice',
                'name_my' => 'သရက်သီး ကောက်ညှင်းထမင်း',
                'description_en' => 'Sweet mango with glutinous rice',
                'description_my' => 'ချိုသော သရက်သီးနှင့် ကောက်ညှင်းထမင်း',
                'price' => 3500,
            ],
            [
                'category_id' => $cat['Desserts']->id,
                'name_en' => 'Ice Cream',
                'name_my' => 'ရေခဲမုန့်',
                'description_en' => 'Three scoops of ice cream',
                'description_my' => 'ရေခဲမုန့် သုံးခဲ',
                'price' => 2000,
            ],
        ];

        foreach ($items as $item) {
            MenuItem::create($item);
        }
    }
}
