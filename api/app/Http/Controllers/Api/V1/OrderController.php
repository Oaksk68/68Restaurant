<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\MenuItem;
use App\Models\RestaurantTable;
use App\Events\OrderCreated;
use App\Events\OrderUpdated;
use App\Events\OrderItemUpdated;
use Illuminate\Http\Request;
use Carbon\Carbon;

class OrderController extends Controller
{
    public function index()
    {
        $orders = Order::with(['table', 'items.menuItem', 'creator'])
            ->whereIn('status', ['open', 'billed'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json(['data' => $orders]);
    }

    public function show(Order $order)
    {
        $order->load(['table', 'items.menuItem', 'payment', 'creator']);

        return response()->json(['data' => $order]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'table_id' => 'required|exists:restaurant_tables,id',
            'note' => 'nullable|string',
        ]);

        $table = RestaurantTable::findOrFail($data['table_id']);
        $order = $table->activeOrder;

        if (!$order) {
            $order = Order::create([
                'table_id' => $data['table_id'],
                'status' => 'open',
                'note' => $data['note'] ?? null,
                'created_by' => $request->user()?->id,
                'opened_at' => Carbon::now(),
            ]);
            $table->update(['status' => 'occupied']);
        }

        $order->load(['table', 'items.menuItem']);
        broadcast(new OrderCreated($order))->toOthers();

        return response()->json(['data' => $order], 201);
    }

    public function addItems(Request $request, Order $order)
    {
        $request->validate([
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.note' => 'nullable|string',
        ]);

        foreach ($request->items as $itemData) {
            $menuItem = MenuItem::findOrFail($itemData['menu_item_id']);

            OrderItem::create([
                'order_id' => $order->id,
                'menu_item_id' => $menuItem->id,
                'quantity' => $itemData['quantity'],
                'unit_price' => $menuItem->price,
                'note' => $itemData['note'] ?? null,
                'status' => 'pending',
            ]);
        }

        $order->load(['table', 'items.menuItem']);
        broadcast(new OrderUpdated($order))->toOthers();

        return response()->json(['data' => $order]);
    }

    public function updateItem(Request $request, Order $order, OrderItem $orderItem)
    {
        $data = $request->validate([
            'quantity' => 'sometimes|integer|min:1',
            'status' => 'sometimes|in:pending,preparing,served',
            'note' => 'nullable|string',
        ]);

        $orderItem->update($data);
        broadcast(new OrderItemUpdated($orderItem));
        broadcast(new OrderUpdated($order->fresh(['table', 'items.menuItem'])));

        return response()->json(['data' => $orderItem->load('menuItem')]);
    }

    public function destroyItem(Order $order, OrderItem $orderItem)
    {
        $orderItem->delete();
        broadcast(new OrderUpdated($order->fresh(['table', 'items.menuItem'])));

        return response()->json(null, 204);
    }

    public function bill(Order $order)
    {
        $order->update(['status' => 'billed']);
        broadcast(new OrderUpdated($order->fresh(['table', 'items.menuItem'])));

        return response()->json([
            'data' => $order->load(['items.menuItem']),
            'total' => $order->getTotal(),
        ]);
    }
}
