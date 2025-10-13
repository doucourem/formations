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
        'client_name',
        'client_nina',
        'seat_number',
        'price',
        'status',
        'stop_id',
    ];

    public function trip()
    {
        return $this->belongsTo(Trip::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }


 public function stop()
{
    return $this->belongsTo(RouteStop::class, 'stop_id');
}


}
