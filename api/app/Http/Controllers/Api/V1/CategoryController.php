<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    public function index()
    {
        return response()->json(['data' => Category::orderBy('sort_order')->get()]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name_en' => 'required|string',
            'name_my' => 'required|string',
            'sort_order' => 'sometimes|integer',
        ]);

        return response()->json(['data' => Category::create($data)], 201);
    }

    public function update(Request $request, Category $category)
    {
        $data = $request->validate([
            'name_en' => 'sometimes|string',
            'name_my' => 'sometimes|string',
            'sort_order' => 'sometimes|integer',
        ]);

        $category->update($data);

        return response()->json(['data' => $category]);
    }

    public function destroy(Category $category)
    {
        $category->delete();

        return response()->json(null, 204);
    }
}
