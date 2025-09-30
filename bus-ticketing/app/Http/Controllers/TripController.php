<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Trip;

class TripController extends Controller
{
    public function index(Request $request)
{
    $perPage = $request->input('per_page', 20);
    $busId = $request->input('bus_id');
    $routeId = $request->input('route_id');

    $trips = \App\Models\Trip::with(['bus', 'route.departureCity', 'route.arrivalCity'])
        ->when($busId, fn($q) => $q->where('bus_id', $busId))
        ->when($routeId, fn($q) => $q->where('route_id', $routeId))
        ->orderBy('departure_at')
        ->paginate($perPage)
        ->withQueryString();

    // Générer l'URL d'édition pour chaque trajet
    $trips->getCollection()->transform(function ($t) {
        $t->edit_url = route('trips.edit', $t->id);
        return $t;
    });

    return Inertia::render('Trips/Index', [
        'initialTrips' => $trips,
        'initialFilters' => [
            'bus_id' => $busId,
            'route_id' => $routeId,
            'per_page' => $perPage,
        ],
    ]);
}

    public function create()
    {
        return Inertia::render('Trips/Create');
    }

    public function edit(Trip $trip)
    {
        $trip->load(['route', 'bus']);
        return Inertia::render('Trips/Edit', [
            'trip' => $trip
        ]);
    }
}
