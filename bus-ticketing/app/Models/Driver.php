<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Driver extends Model
{
    protected $fillable = [
        'first_name', 'last_name', 'birth_date', 'phone', 'email', 'address', 'photo'
    ];

    public function documents()
    {
        return $this->hasMany(DriverDocument::class);
    }

    public function assignments()
    {
        return $this->hasMany(DriverAssignment::class);
    }

    public function trips()
    {
        return $this->hasManyThrough(
            Trip::class, 
            DriverAssignment::class,
            'driver_id', // Foreign key on assignments
            'id',        // Foreign key on trips
            'id',        // Local key on driver
            'trip_id'    // Local key on assignment
        );
    }
}
