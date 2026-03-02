<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class VehicleRentalPayment extends Model
{
    protected $fillable = [
        'vehicle_rental_id',
        'user_id',
        'amount',
        'currency',
        'payment_method',
        'reference',
        'status',
        'note',
        'paid_at'
    ];

    public function rental()
    {
        return $this->belongsTo(VehicleRental::class, 'vehicle_rental_id');
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
