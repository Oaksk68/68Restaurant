<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MenuController extends Controller
{
    public function index()
    {
        $categories = Category::with(['menuItems' => fn($q) => $q->where('is_available', true)])
            ->orderBy('sort_order')
            ->get();

        return response()->json(['data' => $categories]);
    }

    public function indexItems()
    {
        $items = MenuItem::with('category')->orderBy('category_id')->orderBy('name_en')->get();

        return response()->json(['data' => $items]);
    }

    public function storeItem(Request $request)
    {
        $data = $request->validate([
            'category_id' => 'required|exists:categories,id',
            'name_en' => 'required|string|max:100',
            'name_my' => 'required|string|max:100',
            'description_en' => 'nullable|string',
            'description_my' => 'nullable|string',
            'price' => 'required|integer|min:0',
            'is_available' => 'boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $data['image_path'] = $request->file('image')->store('menu', 'public');
        }
        unset($data['image']);

        $item = MenuItem::create($data);

        return response()->json(['data' => $item], 201);
    }

    public function updateItem(Request $request, MenuItem $menuItem)
    {
        $data = $request->validate([
            'category_id' => 'sometimes|exists:categories,id',
            'name_en' => 'sometimes|string|max:100',
            'name_my' => 'sometimes|string|max:100',
            'description_en' => 'nullable|string',
            'description_my' => 'nullable|string',
            'price' => 'sometimes|integer|min:0',
            'is_available' => 'sometimes|boolean',
            'image' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('image')) {
            if ($menuItem->image_path) {
                Storage::disk('public')->delete($menuItem->image_path);
            }
            $data['image_path'] = $request->file('image')->store('menu', 'public');
        }
        unset($data['image']);

        $menuItem->update($data);

        return response()->json(['data' => $menuItem]);
    }

    public function destroyItem(MenuItem $menuItem)
    {
        if ($menuItem->image_path) {
            Storage::disk('public')->delete($menuItem->image_path);
        }
        $menuItem->delete();

        return response()->json(null, 204);
    }
}
