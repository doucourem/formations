<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\BusMaintenance;
use App\Models\Garage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BusMaintenanceController extends Controller
{
    // Liste des maintenances pour un bus
    public function index(Bus $bus)
{
    return Inertia::render('Buses/MaintenanceIndex', [
        'bus' => $bus,
        'maintenances' => $bus->maintenances()->orderBy('maintenance_date', 'desc')->get(),
        'garages' => Garage::orderBy('name')->get(), // Ajout des garages
    ]);
}


    // Ajouter une maintenance
    public function store(Request $request)
    {
        $validated = $request->validate([
    'bus_id' => 'required|exists:buses,id',
    'maintenance_date' => 'required|date',
    'type' => 'required|string|max:255',
    'cost' => 'required|integer|min:0',
    'mileage' => 'nullable|integer|min:0',
    'labour_cost' => 'nullable|integer|min:0',
    'parts' => 'nullable|string',
    'duration_hours' => 'nullable|numeric|min:0',
    'garage_id' => 'nullable|exists:garages,id',
    'photo_before' => 'nullable|image|max:5120', // max 5MB
    'photo_after' => 'nullable|image|max:5120',
    'notes' => 'nullable|string',
]);

if ($request->hasFile('photo_before')) {
    $validated['photo_before'] = $request->file('photo_before')->store('maintenances', 'public');
}

if ($request->hasFile('photo_after')) {
    $validated['photo_after'] = $request->file('photo_after')->store('maintenances', 'public');
}


      $maintenance = BusMaintenance::create($validated);

if (!empty($validated['mileage'])) {
    $bus = Bus::find($validated['bus_id']);
    $bus->last_maintenance_km = $validated['mileage'];
    $bus->next_maintenance_km = $validated['mileage'] + 5000;
    $bus->save();
}
        return back()->with('success', 'Maintenance ajoutée avec succès');
    }
}
