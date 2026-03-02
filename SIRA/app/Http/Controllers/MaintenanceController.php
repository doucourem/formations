<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\BusMaintenance;
use Inertia\Inertia;

class MaintenanceController extends Controller
{
    public function index(Request $request)
    {
        $query = BusMaintenance::with(['bus', 'garage', 'maintenance_plan']);

        // Filtres
        if ($request->bus_id) {
            $query->where('bus_id', $request->bus_id);
        }

        if ($request->type) {
            $query->where('type', $request->type);
        }

        if ($request->garage_id) {
            $query->where('garage_id', $request->garage_id);
        }

        if ($request->from_date) {
            $query->whereDate('maintenance_date', '>=', $request->from_date);
        }

        if ($request->to_date) {
            $query->whereDate('maintenance_date', '<=', $request->to_date);
        }

        $maintenances = $query->orderBy('maintenance_date', 'desc')->get();

        return Inertia::render('Maintenance/Index', [
            'maintenances' => $maintenances,
            'filters' => $request->all(),
        ]);
    }
}
