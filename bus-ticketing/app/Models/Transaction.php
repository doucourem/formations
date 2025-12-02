<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'transfer_id',
        'amount',
        'method',
        'status',
        'proof',
        'user_id',
        'paid_at',
    ];

    public function transfer()
    {
        return $this->belongsTo(Transfer::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
