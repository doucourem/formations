<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DeliveryPayment extends Model
{
    protected $fillable = [
        'delivery_id',
        'user_id',
        'amount',
        'method',
        'note',
    ];

    public function delivery()
    {
        return $this->belongsTo(Delivery::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
