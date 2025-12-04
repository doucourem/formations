<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transfer extends Model
{
    protected $fillable = [
    'sender_id',
    'receiver_id',
    'amount',
    'fees',
    'withdraw_code',
    'status',
    'paid', // ← ajouté
];


    public function sender() {
        return $this->belongsTo(Sender::class);
    }

    public function receiver() {
        return $this->belongsTo(Receiver::class);
    }

    
}
