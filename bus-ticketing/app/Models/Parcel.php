<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parcel extends Model
{
    use HasFactory;

   protected $fillable = [
        'trip_id',
        'tracking_number',
        'sender_name',
        'sender_phone',
        'recipient_name',
        'recipient_phone',
        'weight_kg',
        'price',
        'description',
        'status',
        'parcel_image',
        'departure_agency_id', // ✅ ajout
        'arrival_agency_id',   // ✅ ajout
    ];


public function departureAgency()
    {
        return $this->belongsTo(Agency::class, 'departure_agency_id');
    }

    public function arrivalAgency()
    {
        return $this->belongsTo(Agency::class, 'arrival_agency_id');
    }

    // Relation vers le voyage
    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    // Relation vers le ticket
    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public static function getStatsByRoute()
{
    // Retourne le nombre de colis par route
    return self::selectRaw('route_id, COUNT(*) as parcels_count')
        ->groupBy('route_id')
        ->with('route')
        ->get();
}

}