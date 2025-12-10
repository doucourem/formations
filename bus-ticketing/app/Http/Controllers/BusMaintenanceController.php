<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\BusMaintenance;
use Illuminate\Http\Request;
use Inertia\Inertia;
class BusMaintenanceController extends Controller
{
    public function index(Bus $bus)
    {
        return Inertia::render('Buses/MaintenanceIndex', [
            'bus' => $bus,
            'maintenances' => $bus->maintenances()->orderBy('maintenance_date', 'desc')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'bus_id' => 'required|exists:buses,id',
            'maintenance_date' => 'required|date',
            'type' => 'required|string|max:255',
            'cost' => 'required|integer|min:0',
            'mileage' => 'nullable|integer|min:0',
            'notes' => 'nullable|string',
        ]);

        BusMaintenance::create($request->all());
        $bus = Bus::find($request->bus_id);
    $bus->last_maintenance_km = $request->mileage;
    $bus->next_maintenance_km = $request->mileage + 5000; // prévoir 5 000 km après
    $bus->save();

        return back()->with('success', 'Maintenance ajoutée');
    }
}
