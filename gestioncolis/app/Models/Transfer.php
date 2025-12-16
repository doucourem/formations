<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany; // <- important pour le type hint

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
        'amount_sent',
        'amount_to_pay',
        'code',
        'notes',
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

    // Relation avec User
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relation correcte avec Transaction
    public function transactions(): HasMany
    {
        // Ici 'transfer_id' doit être la clé étrangère dans la table transactions
        return $this->hasMany(Transaction::class, 'transfer_id'); 
    }
}

