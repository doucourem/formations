<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bus extends Model
{
    use HasFactory;

   
    protected $fillable = [
        'agency_id',
        'type',
        'registration_number',
        'model',
        'capacity',
        'current_mileage',
        'status',
        'product_type',
        'last_inspection_date',
        'next_inspection_date',
    ];


    /* SCOPES */
    public function scopeBus($query)
    {
        return $query->where('type', 'bus');
    }

    public function scopeTruck($query)
    {
        return $query->where('type', 'truck');
    }

    public function scopeCistern($query)
    {
        return $query->where('type', 'cistern');
    }


    /**
     * Relation : un bus appartient à une agence
     */
    public function agency()
    {
        return $this->belongsTo(Agency::class);
    }

    public function trips()
{
    return $this->hasMany(Trip::class);
}

    public function maintenances()
{
    return $this->hasMany(BusMaintenance::class);
}
}
