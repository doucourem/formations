<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Route;
use Illuminate\Support\Facades\DB;

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
    return Route::with(['trips.parcels', 'departureCity', 'arrivalCity'])
        ->get()
        ->map(function($r) {
            $parcelsCount = $r->trips->sum(fn($t) => $t->parcels->count());
            $revenue = $r->trips->sum(fn($t) => $t->parcels->sum('price'));

            return [
                'route' => ($r->departureCity->name ?? '-') . ' → ' . ($r->arrivalCity->name ?? '-'),
                'parcels_count' => $parcelsCount,
                'revenue' => $revenue,
            ];
        })
        ->sortByDesc('parcels_count')
        ->take(5)
        ->values()
        ->toArray();
}






}