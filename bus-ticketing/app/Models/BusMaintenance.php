<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusMaintenance extends Model
{
    protected $fillable = [
        'bus_id',
        'maintenance_date',
        'type',
        'cost',
        'notes',
        'mileage',
    ];

    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }
}
