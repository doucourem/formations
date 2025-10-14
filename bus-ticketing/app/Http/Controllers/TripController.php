<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Trip;
use App\Models\Bus;
use App\Models\Route as TripRoute;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $busId = $request->input('bus_id');
        $routeId = $request->input('route_id');

        // Récupération des trajets filtrés avec le nombre de tickets vendus
        $trips = Trip::with(['bus', 'route.departureCity', 'route.arrivalCity'])
            ->withCount('tickets')
            ->when($busId, fn($q) => $q->where('bus_id', $busId))
            ->when($routeId, fn($q) => $q->where('route_id', $routeId))
            ->orderByDesc('departure_at')
            ->paginate($perPage)
            ->withQueryString();

        $trips->getCollection()->transform(function ($t) {
            $t->edit_url = route('trips.edit', $t->id);

            $t->route = $t->route ?? (object)[
                'departureCity' => (object)['name' => '-'],
                'arrivalCity' => (object)['name' => '-'],
                'price' => 0,
            ];

            $t->route->departureCity = $t->route->departureCity ?? (object)['name' => '-'];
            $t->route->arrivalCity = $t->route->arrivalCity ?? (object)['name' => '-'];

            // Calcul des places disponibles
            $t->places_dispo = max(($t->bus->capacity ?? 0) - $t->tickets_count, 0);

            return $t;
        });

        $buses = Bus::select('id', 'model', 'registration_number', 'capacity')
            ->orderBy('model')
            ->get();

        $routes = TripRoute::with(['departureCity:id,name', 'arrivalCity:id,name'])
            ->select('id', 'departure_city_id', 'arrival_city_id', 'price')
            ->orderBy('id', 'desc')
            ->get();

        return Inertia::render('Trips/Index', [
            'initialTrips' => $trips,
            'initialFilters' => [
                'bus_id' => $busId,
                'route_id' => $routeId,
                'per_page' => $perPage,
            ],
            'buses' => $buses,
            'routes' => $routes,
        ]);
    }

    public function create()
    {
        $routes = TripRoute::with(['departureCity:id,name', 'arrivalCity:id,name'])
            ->get()
            ->map(fn($route) => [
                'id' => $route->id,
                'departure_city' => $route->departureCity->name ?? '-',
                'arrival_city' => $route->arrivalCity->name ?? '-',
            ]);

        $buses = Bus::select('id', 'registration_number', 'model', 'capacity')->get();

        return Inertia::render('Trips/Create', [
            'routes' => $routes,
            'buses' => $buses,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'route_id' => ['required', 'exists:routes,id'],
            'bus_id' => ['required', 'exists:buses,id'],
            'departure_at' => ['required', 'date', 'after_or_equal:today'],
            'arrival_at' => ['required', 'date', 'after:departure_at'],
        ]);

        try {
            Trip::create($validated);
            return Redirect::route('trips.index')->with('success', 'Voyage créé avec succès.');
        } catch (\Throwable $e) {
            return Redirect::back()
                ->with('error', 'Erreur lors de la création du voyage : ' . $e->getMessage())
                ->withInput();
        }
    }

    public function edit(Trip $trip)
    {
        $routes = TripRoute::with(['departureCity:id,name', 'arrivalCity:id,name'])
            ->get()
            ->map(fn($route) => [
                'id' => $route->id,
                'departure_city' => $route->departureCity->name ?? '-',
                'arrival_city' => $route->arrivalCity->name ?? '-',
            ]);

        $buses = Bus::all();

        $tripData = [
            'id' => $trip->id,
            'route_id' => $trip->route_id,
            'bus_id' => $trip->bus_id,
            'departure_at' => Carbon::parse($trip->departure_at)->format('Y-m-d\TH:i'),
            'arrival_at' => Carbon::parse($trip->arrival_at)->format('Y-m-d\TH:i'),
        ];

        return Inertia::render('Trips/Edit', [
            'trip' => $tripData,
            'routes' => $routes,
            'buses' => $buses,
        ]);
    }

    public function update(Request $request, Trip $trip)
    {
        $validated = $request->validate([
            'route_id' => ['required', 'exists:routes,id'],
            'bus_id' => ['required', 'exists:buses,id'],
            'departure_at' => ['required', 'date', 'after_or_equal:today'],
            'arrival_at' => ['required', 'date', 'after:departure_at'],
        ]);

        try {
            $trip->update($validated);
            return Redirect::route('trips.index')->with('success', 'Voyage mis à jour avec succès.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Erreur : ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Trip $trip)
    {
        try {
            $trip->delete();
            return Redirect::route('trips.index')->with('success', 'Voyage supprimé avec succès.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Impossible de supprimer ce voyage.');
        }
    }

    public function show($id)
    {
        $trip = Trip::with([
            'route.departureCity',
            'route.arrivalCity',
            'bus',
            'tickets.user.agency', // tickets liés à leurs utilisateurs et agences
        ])->findOrFail($id);

        $tripData = [
            'id' => $trip->id,
            'departure_at' => $trip->departure_at,
            'arrival_at' => $trip->arrival_at,
            'bus' => $trip->bus ? [
                'id' => $trip->bus->id,
                'registration_number' => $trip->bus->registration_number,
                'capacity' => $trip->bus->capacity,
            ] : null,
            'route' => $trip->route ? [
                'id' => $trip->route->id,
                'departureCity' => $trip->route->departureCity?->name ?? '-',
                'arrivalCity' => $trip->route->arrivalCity?->name ?? '-',
                'price' => $trip->route->price ?? 0,
            ] : null,
            'tickets' => $trip->tickets->map(fn($ticket) => [
                'id' => $ticket->id,
                'client_name' => $ticket->client_name,
                'seat_number' => $ticket->seat_number,
                'price' => $ticket->price,
                'status' => $ticket->status,
                'created_at' => $ticket->created_at->format('d/m/Y H:i'),
                'user' => $ticket->user ? [
                    'name' => $ticket->user->name,
                    'email' => $ticket->user->email,
                    'agency' => $ticket->user->agency ? ['name' => $ticket->user->agency->name] : null,
                ] : null,
            ]),
        ];

        return Inertia::render('Trips/Show', [
            'trip' => $tripData,
        ]);
    }
}
