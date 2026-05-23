<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Payment;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ReportController extends Controller
{
    public function monthly(Request $request)
    {
        $year = $request->input('year', now()->year);
        $month = $request->input('month', now()->month);

        $payments = Payment::whereYear('paid_at', $year)
            ->whereMonth('paid_at', $month)
            ->get();

        $orders = Order::where('status', 'paid')
            ->whereYear('closed_at', $year)
            ->whereMonth('closed_at', $month)
            ->count();

        $topItems = OrderItem::select(
            'menu_item_id',
            DB::raw('SUM(quantity) as total_qty'),
            DB::raw('SUM(quantity * unit_price) as total_revenue')
        )
            ->whereHas('order', fn($q) => $q
                ->where('status', 'paid')
                ->whereYear('closed_at', $year)
                ->whereMonth('closed_at', $month)
            )
            ->with('menuItem:id,name_en,name_my')
            ->groupBy('menu_item_id')
            ->orderByDesc('total_qty')
            ->limit(10)
            ->get();

        $daily = Payment::selectRaw('DATE(paid_at) as date, SUM(amount_total) as revenue, COUNT(*) as orders')
            ->whereYear('paid_at', $year)
            ->whereMonth('paid_at', $month)
            ->groupByRaw('DATE(paid_at)')
            ->orderBy('date')
            ->get();

        return response()->json([
            'data' => [
                'year' => $year,
                'month' => $month,
                'total_revenue' => $payments->sum('amount_total'),
                'total_orders' => $orders,
                'daily' => $daily,
                'top_items' => $topItems,
            ],
        ]);
    }

    public function daily(Request $request)
    {
        $date = $request->input('date', now()->toDateString());

        $payments = Payment::whereDate('paid_at', $date)->get();
        $orders = Order::where('status', 'paid')->whereDate('closed_at', $date)->count();

        return response()->json([
            'data' => [
                'date' => $date,
                'total_revenue' => $payments->sum('amount_total'),
                'total_orders' => $orders,
                'payments' => $payments,
            ],
        ]);
    }
}
