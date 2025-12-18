<?php 
// app/Models/MaintenanceTask.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceTask extends Model
{
    protected $fillable = ['maintenance_plan_id', 'task_name', 'mandatory'];

    public function plan()
    {
        return $this->belongsTo(MaintenancePlan::class, 'maintenance_plan_id');
    }
}
