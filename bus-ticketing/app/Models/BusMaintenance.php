<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BusMaintenance extends Model
{
    use HasFactory;

    protected $fillable = [
        'bus_id',
        'garage_id',
        'maintenance_date',
        'type',
        'cost',
        'labour_cost',
        'parts',
        'duration_hours',
        'notes',
        'mileage',
        'photo_before',
        'photo_after',
    ];

    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }
}
