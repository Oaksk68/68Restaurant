<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = ['name', 'email', 'password', 'role'];

    protected $hidden = ['password', 'remember_token'];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
        ];
    }

    public function orders()
    {
        return $this->hasMany(Order::class, 'created_by');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class, 'received_by');
    }

    public function isOwner(): bool
    {
        return $this->role === 'owner';
    }

    public function isWaiter(): bool
    {
        return $this->role === 'waiter';
    }

    public function isChef(): bool
    {
        return $this->role === 'chef';
    }
}
