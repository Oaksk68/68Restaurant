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
                'name_my' => 'ကော်ပြန့်လိပ်ကြော်',
                'description_en' => 'Crispy vegetable spring rolls',
                'description_my' => 'ကြွပ်ကြွပ်ရွရွ သတ်သတ်လွတ် ကော်ပြန့်လိပ်ကြော်',
                'price' => 3000,
            ],
            [
                'category_id' => $cat['Appetizers']->id,
                'name_en' => 'Soup of the Day',
                'name_my' => 'ယနေ့ စပါယ်ရှယ် ဟင်းရည်',
                'description_en' => "Chef's special soup",
                'description_my' => 'စားဖိုမှူး၏ အထူးဟင်းရည်',
                'price' => 2500,
            ],
            // Main Course
            [
                'category_id' => $cat['Main Course']->id,
                'name_en' => 'Chicken Fried Rice',
                'name_my' => 'ကြက်ထမင်းကြော်',
                'description_en' => 'Wok-fried rice with chicken and vegetables',
                'description_my' => 'ကြက်သားနှင့် ဟင်းသီးဟင်းရွက် ထမင်းကြော်',
                'price' => 5000,
            ],
            [
                'category_id' => $cat['Main Course']->id,
                'name_en' => 'Beef Noodles',
                'name_my' => 'အမဲသားခေါက်ဆွဲ',
                'description_en' => 'Rich beef broth noodles',
                'description_my' => 'အမဲသားခေါက်ဆွဲ',
                'price' => 6000,
            ],
            [
                'category_id' => $cat['Main Course']->id,
                'name_en' => 'Grilled Fish',
                'name_my' => 'ငါးကင်',
                'description_en' => 'Freshly grilled fish with herbs',
                'description_my' => 'ဆေးဖက်ဝင်သော အပင်များနှင့် ငါးကင်',
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
                'name_my' => 'သံပရာရည်',
                'description_en' => 'Fresh squeezed lime juice',
                'description_my' => 'လတ်ဆတ်သော သံပရာ ဖျော်ရည်',
                'price' => 1500,
            ],
            [
                'category_id' => $cat['Drinks']->id,
                'name_en' => 'Iced Tea',
                'name_my' => 'Iced Tea',
                'description_en' => 'Burmese style iced milk tea',
                'description_my' => 'မြန်မာရေခဲနို့ဖျော်လက်ဖက်ရည်',
                'price' => 1000,
            ],
            // Desserts
            [
                'category_id' => $cat['Desserts']->id,
                'name_en' => 'Mango Sticky Rice',
                'name_my' => 'ကောက်ညှင်းနှင့်သရက်သီး',
                'description_en' => 'Sweet mango with glutinous rice',
                'description_my' => 'ချိုသော သရက်သီးနှင့် ကောက်ညှင်းထမင်း',
                'price' => 3500,
            ],
            [
                'category_id' => $cat['Desserts']->id,
                'name_en' => 'Ice Cream',
                'name_my' => 'ရေခဲမုန့်',
                'description_en' => 'Three scoops of ice cream',
                'description_my' => 'Three scoops of ice cream',
                'price' => 2000,
            ],
        ];

        foreach ($items as $item) {
            MenuItem::updateOrCreate(
                [
                    'name_en' => $item['name_en'],
                    'category_id' => $item['category_id'],
                ],
                [
                    'name_my' => $item['name_my'],
                    'description_en' => $item['description_en'],
                    'description_my' => $item['description_my'],
                    'price' => $item['price'],
                ]
            );
        }
    }
}
