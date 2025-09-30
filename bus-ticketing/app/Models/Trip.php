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

    // Relation avec le bus
    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    // Relation avec la route
    public function route()
    {
        return $this->belongsTo(Route::class);
    }
}
