<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleRentalExpense extends Model
{
    use HasFactory;

    protected $fillable = [
        'rental_id',  // clé étrangère vers VehicleRental
        'type',       // chauffeur, fuel, toll, meal, maintenance, other
        'amount',
        'description',
    ];

    public function rental()
{
    return $this->belongsTo(VehicleRental::class, 'vehicle_rental_id');
}

}
