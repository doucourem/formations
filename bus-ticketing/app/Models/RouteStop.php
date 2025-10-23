<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RouteStop extends Model
{
    use HasFactory;

    protected $fillable = [
        'route_id',
        'city_id',
        'to_city_id',
        'order',
        'distance_from_start',
        'partial_price',
    ];

    public function route()
    {
        return $this->belongsTo(Route::class);
    }

    public function city()
    {
        return $this->belongsTo(City::class);
    }

      /**
     * 🔹 Ville d’arrivée du stop
     */
    public function toCity()
    {
        return $this->belongsTo(City::class, 'to_city_id');
    }
}
