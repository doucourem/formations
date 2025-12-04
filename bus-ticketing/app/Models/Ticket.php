<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'user_id',
        'client_name',
        'client_nina',
        'seat_number',
        'price',
        'status',
        'start_stop_id',  // ajouté
        'end_stop_id',    // ajouté
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function startStop()
    {
        return $this->belongsTo(RouteStop::class, 'start_stop_id');
    }

    public function endStop()
    {
        return $this->belongsTo(RouteStop::class, 'end_stop_id');
    }

    // Relation vers les colis
    public function parcels()
    {
        return $this->hasMany(Parcel::class);
    }

    public function baggages()
{
    return $this->hasMany(baggages::class);
}

}
