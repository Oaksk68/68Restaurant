<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\RestaurantTable;
use App\Models\Order;
use App\Events\OrderCreated;
use Illuminate\Http\Request;
use Carbon\Carbon;

class TableController extends Controller
{
    public function index()
    {
        $tables = RestaurantTable::with(['activeOrder.items.menuItem'])
            ->orderBy('number')
            ->get();

        return response()->json(['data' => $tables]);
    }

    public function show(RestaurantTable $restaurantTable)
    {
        $restaurantTable->load(['activeOrder.items.menuItem']);

        return response()->json(['data' => $restaurantTable]);
    }

    public function openOrder(Request $request, RestaurantTable $restaurantTable)
    {
        // Return existing open order or create new
        $order = $restaurantTable->activeOrder;

        if (!$order) {
            $order = Order::create([
                'table_id' => $restaurantTable->id,
                'status' => 'open',
                'created_by' => $request->user()?->id,
                'opened_at' => Carbon::now(),
            ]);
            $restaurantTable->update(['status' => 'occupied']);
            broadcast(new OrderCreated($order->load(['table', 'items'])))->toOthers();
        }

        $order->load(['items.menuItem']);

        return response()->json(['data' => $order], 201);
    }
}
