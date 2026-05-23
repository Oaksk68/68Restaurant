<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Payment;
use App\Events\OrderUpdated;
use Illuminate\Http\Request;
use Carbon\Carbon;

class PaymentController extends Controller
{
    public function pay(Request $request, Order $order)
    {
        $data = $request->validate([
            'method' => 'required|in:cash,qr',
            'amount_paid' => 'required|integer|min:0',
        ]);

        $total = $order->getTotal();
        $change = max(0, $data['amount_paid'] - $total);

        $payment = Payment::create([
            'order_id' => $order->id,
            'method' => $data['method'],
            'amount_total' => $total,
            'amount_paid' => $data['amount_paid'],
            'change_given' => $change,
            'received_by' => $request->user()->id,
            'paid_at' => Carbon::now(),
        ]);

        $order->update(['status' => 'paid', 'closed_at' => Carbon::now()]);
        $order->table->update(['status' => 'available']);

        broadcast(new OrderUpdated($order->fresh(['table', 'items.menuItem', 'payment'])));

        return response()->json(['data' => $payment, 'change' => $change]);
    }
}
