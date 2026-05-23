<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Payment extends Model
{
    protected $fillable = [
        'order_id',
        'method',
        'amount_total',
        'amount_paid',
        'change_given',
        'received_by',
        'paid_at',
    ];

    protected $casts = [
        'amount_total' => 'integer',
        'amount_paid' => 'integer',
        'change_given' => 'integer',
        'paid_at' => 'datetime',
    ];

    public function order()
    {
        return $this->belongsTo(Order::class);
    }

    public function receivedBy()
    {
        return $this->belongsTo(User::class, 'received_by');
    }
}
