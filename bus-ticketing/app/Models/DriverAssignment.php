<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DriverAssignment extends Model {
    protected $fillable = ['driver_id','bus_id','trip_id','start_time','end_time'];

    public function driver() {
        return $this->belongsTo(Driver::class);
    }

    public function bus() {
        return $this->belongsTo(Bus::class);
    }

    public function trip() {
        return $this->belongsTo(Trip::class);
    }
}