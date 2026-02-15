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
        'price',             // Montant total
        'paid_amount',       // Montant déjà payé
        'remaining_amount',  // Montant restant à payer
        'description',
        'status',
        'parcel_image'
    ];

    // 🔹 Relations
    public function departureAgency()
    {
        return $this->belongsTo(Agency::class, 'departure_agency_id');
    }

    public function arrivalAgency()
    {
        return $this->belongsTo(Agency::class, 'arrival_agency_id');
    }

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function ticket()
    {
        return $this->belongsTo(Ticket::class);
    }

    public function payments()
    {
        return $this->hasMany(ParcelPayment::class);
    }

    // 🔹 Stats par route
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

    // 🔹 Initialiser les montants lors de la création
    protected static function booted()
    {
        static::creating(function ($parcel) {
            if (is_null($parcel->paid_amount)) {
                $parcel->paid_amount = 0;
            }
            if (is_null($parcel->remaining_amount)) {
                $parcel->remaining_amount = $parcel->price ?? 0;
            }
        });
    }
}
