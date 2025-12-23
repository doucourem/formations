<?php 
// app/Models/MaintenancePlan.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenancePlan extends Model
{
    protected $fillable = [
        'name',
        'interval_type',
        'interval_value',
        'vehicle_type',
        'description'
    ];

    public function tasks()
    {
        return $this->hasMany(MaintenancePlanTask::class);
    }

}