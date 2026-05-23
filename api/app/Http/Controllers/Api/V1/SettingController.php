<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class SettingController extends Controller
{
    public function index()
    {
        $qrPath = Setting::get('payment_qr_path');

        return response()->json([
            'data' => [
                'restaurant_name' => Setting::get('restaurant_name'),
                'payment_qr_url' => $qrPath ? Storage::url($qrPath) : null,
            ],
        ]);
    }

    public function update(Request $request)
    {
        if ($request->has('restaurant_name')) {
            Setting::set('restaurant_name', $request->input('restaurant_name'));
        }

        if ($request->hasFile('payment_qr')) {
            $oldPath = Setting::get('payment_qr_path');
            if ($oldPath) {
                Storage::disk('public')->delete($oldPath);
            }
            $path = $request->file('payment_qr')->store('qr', 'public');
            Setting::set('payment_qr_path', $path);
        }

        return response()->json(['message' => 'Settings updated']);
    }
}
