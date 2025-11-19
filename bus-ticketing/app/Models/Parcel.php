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
        'sender_phone',    // Ajout du numéro de téléphone de l'expéditeur
        'recipient_name',
        'recipient_phone', // Ajout du numéro de téléphone du destinataire
        'weight_kg',
        'description',
        'price',           // Ajout du prix
        'status',          // Exemple : 'pending', 'in_transit', 'delivered'
        'sent_at',
        'delivered_at',
    ];

    protected $casts = [
        'sent_at' => 'datetime',
        'delivered_at' => 'datetime',
        'price' => 'float', // Cast du prix en float pour assurer un type numérique
    ];

    // 🚌 Relation avec le voyage (Trip)
    /**
     * Get the trip that owns the parcel.
     */
    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    // 🕒 Formattage automatique des dates
    public function getFormattedSentAttribute()
    {
        return $this->sent_at
            ? $this->sent_at->format('d/m/Y H:i')
            : null;
    }

    public function getFormattedDeliveredAttribute()
    {
        return $this->delivered_at
            ? $this->delivered_at->format('d/m/Y H:i')
            : null;
    }
}