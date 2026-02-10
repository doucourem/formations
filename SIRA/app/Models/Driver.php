<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'first_name', 'last_name', 'birth_date', 'phone', 'email', 'address', 'photo', 'company_id'
    ];

    public function company()
    {
        return $this->belongsTo(Companies::class);
    }

    public function documents()
    {
        return $this->hasMany(DriverDocument::class);
    }

    public function assignments()
    {
        return $this->hasMany(DriverAssignment::class);
    }

    // Relation vers les voyages via la table pivot
    public function trips()
    {
        return $this->belongsToMany(
            Trip::class,
            'driver_assignments',
            'driver_id',
            'trip_id'
        )->with('route.departureCity', 'route.arrivalCity');
    }
}


