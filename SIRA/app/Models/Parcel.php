<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use App\Models\Route;

class Parcel extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'tracking_number',

        // Expéditeur
        'sender_name',
        'sender_phone',

        // Destinataire
        'recipient_name',
        'recipient_phone',

        // Marchandise
        'weight_kg',
        'merchandise_value', // ✅ valeur marchandise

        // Prix
        'price',

        // Autres
        'description',
        'status',
        'parcel_image',

        // Agences
        'departure_agency_id',
        'arrival_agency_id',
    ];

    /* ============================
     | Relations
     ============================ */

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function departureAgency()
    {
        return $this->belongsTo(Agency::class, 'departure_agency_id');
    }

    public function arrivalAgency()
    {
        return $this->belongsTo(Agency::class, 'arrival_agency_id');
    }

    /* ============================
     | Statistiques par route
     ============================ */

    public static function getStatsByRoute()
    {
        return Route::with([
                'trips.parcels',
                'departureCity',
                'arrivalCity'
            ])
            ->get()
            ->map(function ($route) {

                $parcelsCount = $route->trips
                    ->sum(fn ($trip) => $trip->parcels->count());

                $revenue = $route->trips
                    ->sum(fn ($trip) => $trip->parcels->sum('price'));

                $merchandiseValue = $route->trips
                    ->sum(fn ($trip) => $trip->parcels->sum('merchandise_value'));

                return [
                    'route' => ($route->departureCity->name ?? '-')
                             . ' → '
                             . ($route->arrivalCity->name ?? '-'),

                    'parcels_count'     => $parcelsCount,
                    'revenue'           => $revenue,
                    'merchandise_value' => $merchandiseValue,
                ];
            })
            ->sortByDesc('parcels_count')
            ->take(5)
            ->values()
            ->toArray();
    }
}
