<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\BusMaintenance;
use App\Models\MaintenancePlan;
use App\Models\Garage;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\MaintenanceTask;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class BusMaintenanceController extends Controller
{
    // Liste des maintenances pour un bus
  public function index(Bus $bus)
{
    return Inertia::render('Buses/MaintenanceIndex', [
        'bus' => $bus,
        'maintenances' => $bus->maintenances()
            ->with('maintenance_plan') // Charger le plan lié
            ->orderBy('maintenance_date', 'desc')
            ->get(),
        'garages' => Garage::orderBy('name')->get(),
        'maintenancePlans' => MaintenancePlan::orderBy('name')->get(), // Passer les plans
    ]);
}


    // Ajouter une maintenance


public function store(Request $request)
{
    $validated = $request->validate([
        'bus_id' => 'required|exists:buses,id',
        'maintenance_plan_id' => 'required|exists:maintenance_plans,id',
        'maintenance_date' => 'required|date',

        'mileage' => 'nullable|integer|min:0',
        'cost' => 'nullable|integer|min:0',
        'labour_cost' => 'nullable|integer|min:0',
        'parts' => 'nullable|string',
        'duration_hours' => 'nullable|numeric|min:0',

        'garage_id' => 'nullable|exists:garages,id',

        'photo_before' => 'nullable|image|max:5120',
        'photo_after'  => 'nullable|image|max:5120',

        'notes' => 'nullable|string',

        'tasks' => 'nullable|string', // JSON depuis React
    ]);

    DB::transaction(function () use ($request, $validated) {

        // 📸 Upload photos
        if ($request->hasFile('photo_before')) {
            $validated['photo_before'] =
                $request->file('photo_before')->store('maintenances', 'public');
        }

        if ($request->hasFile('photo_after')) {
            $validated['photo_after'] =
                $request->file('photo_after')->store('maintenances', 'public');
        }

        // 🛠️ Création maintenance
        $maintenance = BusMaintenance::create($validated);

        // ✅ Enregistrer checklist
        if ($request->filled('tasks')) {
            $tasks = json_decode($request->tasks, true);

            foreach ($tasks as $task) {
                MaintenanceTask::create([
                    'bus_maintenance_id' => $maintenance->id,
                    'maintenance_plan_task_id' => $task['id'],
                    'status' => $task['status'], // ok | replaced | repair
                ]);
            }
        }
    });

    return redirect()->back()->with('success', 'Maintenance ajoutée avec succès');
}



    // app/Http/Controllers/BusMaintenanceController.php

public function update(Request $request, BusMaintenance $maintenance)
{
    $validated = $request->validate([
        'maintenance_date' => 'required|date',
        'type' => 'required|string',
        'mileage' => 'nullable|integer|min:0',
        'cost' => 'nullable|numeric|min:0',
        'labour_cost' => 'nullable|numeric|min:0',
        'parts' => 'nullable|string',
        'duration_hours' => 'nullable|numeric|min:0',
        'garage_id' => 'nullable|exists:garages,id',
        'photo_before' => 'nullable|image|max:2048',
        'photo_after' => 'nullable|image|max:2048',
        'notes' => 'nullable|string',
    ]);

    if ($request->hasFile('photo_before')) {
        $validated['photo_before'] =
            $request->file('photo_before')->store('maintenances', 'public');
    }

    if ($request->hasFile('photo_after')) {
        $validated['photo_after'] =
            $request->file('photo_after')->store('maintenances', 'public');
    }

    $maintenance->update($validated);

    return back()->with('success', 'Maintenance mise à jour');
}

}
