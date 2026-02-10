<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
class DriverDocument extends Model {
    protected $fillable = ['driver_id','type','number','expiry_date','file_path'];

    public function driver() {
        return $this->belongsTo(Driver::class);
    }
}