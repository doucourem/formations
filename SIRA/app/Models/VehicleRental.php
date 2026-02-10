<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;


class VehicleRental extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'driver_id',          // ✅ AJOUT
        'client_name',
        'rental_price',
        'rental_start',
        'rental_end',
        'departure_location',
        'arrival_location',
        'status',
    ];

    protected $casts = [
        'rental_start' => 'datetime',
        'rental_end'   => 'datetime',
    ];

    public function bus()
    {
        return $this->belongsTo(Bus::class, 'vehicle_id');
    }

    // ✅ RELATION CHAUFFEUR
    public function driver()
    {
        return $this->belongsTo(Driver::class);
    }

    public function expenses()
    {
        return $this->hasMany(VehicleRentalExpense::class, 'vehicle_rental_id');
    }

    public function isActive()
    {
        return $this->status === 'active';
    }
}

