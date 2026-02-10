<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Bus extends Model
{
    use HasFactory;

    protected $fillable = [
        'agency_id',
        'company_id',
        'product_type',                   // bus, truck, tanker
        'registration_number',
        'model',
        'capacity',               // bus
        'max_load',               // truck
        'tank_capacity',          // tanker
        'vehicle_type',           // tanker
        'compartments',           // tanker
        'tank_material',          // tanker
        'pump_type',              // tanker
        'adr_certified',          // tanker
        'fire_extinguisher',      // tanker
        'last_inspection_date',   // tanker
        'next_inspection_date',   // tanker
        'current_mileage',
        'status',
        'year',
        'fuel_type',
        'fuel_capacity',
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
     public function company()
    {
        return $this->belongsTo(Companies::class, 'company_id');
    }
}
