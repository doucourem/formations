<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class VehicleRental extends Model
{
    use HasFactory;

    protected $fillable = [
        'vehicle_id',
        'client_name',
        'rental_price',
        'rental_start',
        'rental_end',
        'status',
    ];

    public function bus()
    {
        return $this->belongsTo(Bus::class, 'vehicle_id');
    }

    public function isActive()
    {
        return $this->status === 'active';
    }
}
