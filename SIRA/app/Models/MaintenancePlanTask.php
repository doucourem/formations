<?php 
// app/Models/MaintenancePlanTask.php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MaintenancePlanTask extends Model
{
    protected $fillable = [
        'maintenance_plan_id', // lien vers le plan
        'task_name',           // nom de la tâche
        'mandatory',           // booléen : tâche obligatoire ou non
    ];

    protected $casts = [
        'mandatory' => 'boolean',
    ];

    // Relation vers le plan
    public function plan()
    {
        return $this->belongsTo(MaintenancePlan::class);
    }

    // Relation vers les tâches réalisées
    public function maintenanceTasks()
    {
        return $this->hasMany(MaintenanceTask::class, 'maintenance_plan_task_id');
    }
}
