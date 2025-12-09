<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    use HasFactory;

    protected $fillable = [
        'sender_id',
        'receiver_id',
        'third_party_id',
        'amount',
        'fees',
        'withdraw_code',
        'status',
        'user_id',
    ];

    // Relation avec Sender
    public function sender()
    {
        return $this->belongsTo(Sender::class);
    }

    // Relation avec Receiver
    public function receiver()
    {
        return $this->belongsTo(Receiver::class);
    }

    // Relation avec ThirdParty
    public function thirdParty()
    {
        return $this->belongsTo(ThirdParty::class);
    }

    // Relation avec User (si tu veux stocker l'utilisateur qui crée le transfert)
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
