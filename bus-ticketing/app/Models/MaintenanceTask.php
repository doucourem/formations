<?php 
// app/Models/MaintenanceTask.php
// app/Models/MaintenanceTask.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenanceTask extends Model
{
    protected $fillable = [
        'bus_maintenance_id',
        'maintenance_plan_task_id',
        'status',
        'notes',
    ];

    public function maintenance()
    {
        return $this->belongsTo(BusMaintenance::class, 'bus_maintenance_id');
    }

    public function planTask()
{
    return $this->belongsTo(MaintenancePlanTask::class, 'maintenance_plan_task_id');
}

}
