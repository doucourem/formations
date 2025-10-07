<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Trip extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'bus_id',
        'departure_at',
        'arrival_at',
        'base_price',
        'seats_available',
    ];

    protected $casts = [
        'departure_at' => 'datetime',
        'arrival_at' => 'datetime',
    ];

    // 🚍 Relation avec le bus
    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    // 🗺️ Relation avec la route
    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    // 🎫 Relation avec les billets
    public function tickets()
    {
        return $this->hasMany(Ticket::class);
    }

    // 🛑 Relation avec les arrêts intermédiaires
    public function stops()
    {
        return $this->hasMany(TripStop::class);
    }

    // 🕒 Formattage automatique des dates
    public function getFormattedDepartureAttribute()
    {
        return $this->departure_at
            ? $this->departure_at->format('d/m/Y H:i')
            : null;
    }

    public function getFormattedArrivalAttribute()
    {
        return $this->arrival_at
            ? $this->arrival_at->format('d/m/Y H:i')
            : null;
    }
}
