<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Parcel extends Model
{
    use HasFactory;

    protected $fillable = [
        'trip_id',
        'ticket_id',
        'tracking_number',
        'sender_name',
        'sender_phone',
        'recipient_name',
        'recipient_phone',
        'weight_kg',
        'price',
        'description',
        'status',
        'sent_at',
        'delivered_at'
    ];

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
}