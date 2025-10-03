<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Trip;
use App\Models\Bus;
use App\Models\Route as TripRoute; // alias pour éviter le conflit avec la façade Route

class TripController extends Controller
{
   public function index(Request $request)
{
    $perPage = $request->input('per_page', 20);
    $busId = $request->input('bus_id');
    $routeId = $request->input('route_id');

    $trips = Trip::with(['bus', 'route.departureCity', 'route.arrivalCity'])
        ->when($busId, fn($q) => $q->where('bus_id', $busId))
        ->when($routeId, fn($q) => $q->where('route_id', $routeId))
        ->orderBy('departure_at')
        ->paginate($perPage)
        ->withQueryString();

    // Ajouter fallback pour route et ses villes
    $trips->getCollection()->transform(function ($t) {
        $t->edit_url = route('trips.edit', $t->id);

        // Fallback si la route ou les villes sont null
        $t->route = $t->route ?? (object)[
            'departureCity' => (object)['name' => '-'],
            'arrivalCity' => (object)['name' => '-']
        ];

        $t->route->departureCity = $t->route->departureCity ?? (object)['name' => '-'];
        $t->route->arrivalCity = $t->route->arrivalCity ?? (object)['name' => '-'];

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
    // Récupérer toutes les routes avec leurs villes de départ et d'arrivée
    $routes = TripRoute::with([
        'departureCity:id,name',
        'arrivalCity:id,name',
    ])->get()
      ->map(function ($route) {
          return [
              'id' => $route->id,
              'departure_city' => $route->departureCity->name ?? '-',
              'arrival_city' => $route->arrivalCity->name ?? '-',
          ];
      });

    // Récupérer tous les bus avec leurs noms et capacités
    $buses = Bus::select('id', 'name', 'capacity')->get();

    // Renvoyer les données à Inertia
    return Inertia::render('Trips/Create', [
        'routes' => $routes,
        'buses' => $buses,
    ]);
}




    public function edit(Trip $trip)
    {
        $routes = TripRoute::with(['departureCity', 'arrivalCity'])->get();
        $buses = Bus::all();

        return Inertia::render('Trips/Edit', [
            'trip' => $trip,
            'routes' => $routes,
            'buses' => $buses,
        ]);
    }
}
