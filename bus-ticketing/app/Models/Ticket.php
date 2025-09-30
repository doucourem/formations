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
        'seat_number',
        'price',
        'status',
    ];

    // Relation avec le voyage
    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    // Relation avec l'utilisateur
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
