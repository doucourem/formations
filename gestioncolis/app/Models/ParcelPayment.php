<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ParcelPayment extends Model
{
    protected $fillable = [
        'parcel_id',
        'user_id',
        'amount',
        'payment_method'
    ];

    public function parcel()
    {
        return $this->belongsTo(Parcel::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
