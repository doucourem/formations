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
        'maintenance_plan_id', // ✅ nouveau
        'maintenance_date',
        'next_due_date',       // ✅ nouveau
        'next_due_mileage',    // ✅ nouveau
        'status',              // ✅ nouveau: planned/done/overdue
        'cost',
        'labour_cost',
        'parts',
        'duration_hours',
        'notes',
        'mileage',
        'photo_before',
        'photo_after',
    ];

    // -----------------------------
    // Relations
    // -----------------------------
    public function bus()
    {
        return $this->belongsTo(Bus::class);
    }

    public function garage()
    {
        return $this->belongsTo(Garage::class);
    }

    public function maintenance_plan()
    {
        return $this->belongsTo(MaintenancePlan::class, 'maintenance_plan_id');
    }

    public function tasks()
    {
        return $this->hasMany(MaintenanceTask::class);
    }
}
