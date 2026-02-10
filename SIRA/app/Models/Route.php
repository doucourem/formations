<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

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
    return self::select('routes.*')
        ->join('trips', 'trips.route_id', '=', 'routes.id')
        ->join('tickets', 'tickets.trip_id', '=', 'trips.id')
        ->selectRaw('routes.id, routes.name as route, COUNT(tickets.id) as tickets_sold, SUM(tickets.price) as revenue')
        ->groupBy('routes.id', 'routes.name') // ajoute toutes les colonnes sélectionnées
        ->orderByDesc('tickets_sold')
        ->limit(5)
        ->get();
}





}
