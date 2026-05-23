<?php

namespace App\Events;

use App\Models\OrderItem;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class OrderItemUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public OrderItem $item) {}

    public function broadcastOn(): array
    {
        return [new Channel('orders.' . $this->item->order_id)];
    }

    public function broadcastWith(): array
    {
        return ['item' => $this->item->load('menuItem')->toArray()];
    }
}
