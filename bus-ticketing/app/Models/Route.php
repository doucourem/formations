<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Route extends Model
{
    use HasFactory;

    protected $fillable = [
        'departure_city_id',
        'arrival_city_id',
        'distance',
        'price',
    ];
    

    // Relation vers la ville de départ
    public function departureCity()
    {
        return $this->belongsTo(City::class, 'departure_city_id');
    }

    // Relation vers la ville d'arrivée
    public function arrivalCity()
    {
        return $this->belongsTo(City::class, 'arrival_city_id');
    }

    public function stops()
{
    return $this->hasMany(RouteStop::class)->orderBy('order');
}

    public function trips()
{
    return $this->hasMany(Trip::class);
}

public static function getStats()
{
    // Retourne les 5 routes les plus fréquentées avec nombre de billets vendus
    return self::withCount('trips')
        ->orderBy('trips_count', 'desc')
        ->take(5)
        ->get();
}

}
