<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Companies extends Model
{
    use HasFactory;

    /**
     * Champs autorisés en mass assignment
     */
    protected $fillable = [
        'name',
        'type',     // passengers | cargo
        'address',
        'contact',
        'logo',
    ];

    /**
     * Casts
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Scopes utiles
     */
    public function scopePassengers($query)
    {
        return $query->where('type', 'passengers');
    }

    public function scopeCargo($query)
    {
        return $query->where('type', 'cargo');
    }


    /**
     * Relations (prêtes pour extension)
     */

    // Véhicules (camions, bus, citernes, etc.)
    public function vehicles()
    {
        return $this->hasMany(Bus::class);
    }

    // Maintenances
    public function maintenances()
    {
        return $this->hasManyThrough(
            BusMaintenance::class,
            Bus::class
        );
    }

    // Chauffeurs
    public function drivers()
    {
        return $this->hasMany(Driver::class);
    }

    // Trajets (transport passagers ou cargo)
    public function trips()
    {
        return $this->hasMany(Trip::class);
    }

    // Billets (pour compagnies passagers)
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    /**
     * Accesseur logo (URL publique)
     */
    public function getLogoUrlAttribute()
    {
        return $this->logo
            ? asset('storage/' . $this->logo)
            : asset('images/company-default.png');
    }

}
