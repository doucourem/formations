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

    // ➜ Relation correcte pour récupérer les voyages du chauffeur
    public function trips()
{
    return $this->belongsToMany(
        Trip::class,           // Modèle cible
        'driver_assignments',  // Table pivot
        'driver_id',           // Clé du chauffeur
        'trip_id'              // Clé du voyage
    )->with('route.departureCity', 'route.arrivalCity');
}

}

