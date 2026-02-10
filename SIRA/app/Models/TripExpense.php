<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TripExpense extends Model
{
    protected $fillable = ['trip_id', 'type', 'amount', 'description'];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }
}
