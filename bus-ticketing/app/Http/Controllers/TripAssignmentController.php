<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\Trip;
use App\Models\Bus;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TripAssignmentController extends Controller
{
    // Affiche le formulaire d'assignation d'un driver
    public function create(Driver $driver)
    {
       $trips = Trip::with([
    'route:id,departure_city_id,arrival_city_id',
    'route.departureCity:id,name',
    'route.arrivalCity:id,name',
])
->whereHas('route.departureCity')
->whereHas('route.arrivalCity')
->get();


        return Inertia::render('Drivers/AssignDriver', [
            'driver' => $driver,
            'buses' => Bus::all(),  // si le driver a des bus disponibles
            'trips' => $trips,
        ]);
    }

    // Enregistre l'assignation
    public function store(Request $request, Driver $driver)
    {
        $request->validate([
            'bus_id' => 'nullable|exists:buses,id',
            'trip_id' => 'nullable|exists:trips,id',
        ]);

        if (!$request->bus_id && !$request->trip_id) {
            return back()->withErrors(['msg' => 'Sélectionnez un bus ou un voyage']);
        }

        if ($request->bus_id) {
            $driver->buses()->syncWithoutDetaching($request->bus_id);
        }

        if ($request->trip_id) {
            $driver->trips()->syncWithoutDetaching($request->trip_id);
        }

        return redirect()->back()->with('success', 'Driver assigné avec succès.');
    }
}
