<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Trip;
use App\Models\Bus;
use App\Models\Route as TripRoute;
use App\Models\TripStop;
use App\Models\City;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class TripController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $busId = $request->input('bus_id');
        $routeId = $request->input('route_id');

        $trips = Trip::with(['bus', 'route.departureCity', 'route.arrivalCity'])
            ->when($busId, fn($q) => $q->where('bus_id', $busId))
            ->when($routeId, fn($q) => $q->where('route_id', $routeId))
            ->orderBy('departure_at')
            ->paginate($perPage)
            ->withQueryString();

        $trips->getCollection()->transform(function ($t) {
            $t->edit_url = route('trips.edit', $t->id);
            $t->route = $t->route ?? (object)[
                'departureCity' => (object)['name' => '-'],
                'arrivalCity' => (object)['name' => '-'],
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
        $routes = TripRoute::with(['departureCity:id,name', 'arrivalCity:id,name'])
            ->get()
            ->map(fn($route) => [
                'id' => $route->id,
                'departure_city' => $route->departureCity->name ?? '-',
                'arrival_city' => $route->arrivalCity->name ?? '-',
            ]);

        $buses = Bus::select('id', 'registration_number', 'model', 'capacity')->get();
        $cities = City::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Trips/Create', [
            'routes' => $routes,
            'buses' => $buses,
            'cities' => $cities,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'route_id' => ['required', 'exists:routes,id'],
            'bus_id' => ['required', 'exists:buses,id'],
            'departure_at' => ['required', 'date', 'after_or_equal:today'],
            'arrival_at' => ['required', 'date', 'after:departure_at'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'seats_available' => ['required', 'integer', 'min:0'],
            'stops' => ['nullable', 'array'],
            'stops.*.city_id' => ['nullable', 'exists:cities,id'],
            'stops.*.distance_from_start' => ['nullable', 'numeric', 'min:0'],
            'stops.*.partial_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        DB::beginTransaction();
        try {
            $trip = Trip::create([
                'route_id' => $validated['route_id'],
                'bus_id' => $validated['bus_id'],
                'departure_at' => $validated['departure_at'],
                'arrival_at' => $validated['arrival_at'],
                'base_price' => $validated['base_price'],
                'seats_available' => $validated['seats_available'],
            ]);

            if (!empty($validated['stops'])) {
                foreach ($validated['stops'] as $stop) {
                    if (!empty($stop['city_id'])) {
                        TripStop::create([
                            'trip_id' => $trip->id,
                            'city_id' => $stop['city_id'],
                            'distance_from_start' => $stop['distance_from_start'] ?? 0,
                            'partial_price' => $stop['partial_price'] ?? 0,
                        ]);
                    }
                }
            }

            DB::commit();
            return Redirect::route('trips.index')->with('success', 'Voyage créé avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::back()->with('error', 'Erreur : ' . $e->getMessage())->withInput();
        }
    }

    public function edit(Trip $trip)
    {
        $routes = TripRoute::with(['departureCity', 'arrivalCity'])
            ->get()
            ->map(fn($route) => [
                'id' => $route->id,
                'departure_city' => $route->departureCity->name ?? '-',
                'arrival_city' => $route->arrivalCity->name ?? '-',
            ]);

        $buses = Bus::all();
        $cities = City::select('id', 'name')->orderBy('name')->get();

        $trip->load('stops.city');

        $tripData = [
            'id' => $trip->id,
            'route_id' => $trip->route_id,
            'bus_id' => $trip->bus_id,
            'departure_at' => Carbon::parse($trip->departure_at)->format('Y-m-d\TH:i'),
            'arrival_at' => Carbon::parse($trip->arrival_at)->format('Y-m-d\TH:i'),
            'base_price' => $trip->base_price,
            'seats_available' => $trip->seats_available,
            'stops' => $trip->stops->map(fn($s) => [
                'city_id' => $s->city_id,
                'distance_from_start' => $s->distance_from_start,
                'partial_price' => $s->partial_price,
            ]),
        ];

        return Inertia::render('Trips/Edit', [
            'trip' => $tripData,
            'routes' => $routes,
            'buses' => $buses,
            'cities' => $cities,
        ]);
    }

    public function update(Request $request, Trip $trip)
    {
        $validated = $request->validate([
            'route_id' => ['required', 'exists:routes,id'],
            'bus_id' => ['required', 'exists:buses,id'],
            'departure_at' => ['required', 'date', 'after_or_equal:today'],
            'arrival_at' => ['required', 'date', 'after:departure_at'],
            'base_price' => ['required', 'numeric', 'min:0'],
            'seats_available' => ['required', 'integer', 'min:0'],
            'stops' => ['nullable', 'array'],
            'stops.*.city_id' => ['nullable', 'exists:cities,id'],
            'stops.*.distance_from_start' => ['nullable', 'numeric', 'min:0'],
            'stops.*.partial_price' => ['nullable', 'numeric', 'min:0'],
        ]);

        DB::beginTransaction();
        try {
            $trip->update($validated);

            // 🔁 Mettre à jour les arrêts
            $trip->stops()->delete();

            if (!empty($validated['stops'])) {
                foreach ($validated['stops'] as $stop) {
                    if (!empty($stop['city_id'])) {
                        TripStop::create([
                            'trip_id' => $trip->id,
                            'city_id' => $stop['city_id'],
                            'distance_from_start' => $stop['distance_from_start'] ?? 0,
                            'partial_price' => $stop['partial_price'] ?? 0,
                        ]);
                    }
                }
            }

            DB::commit();
            return Redirect::route('trips.index')->with('success', 'Voyage mis à jour avec succès.');
        } catch (\Exception $e) {
            DB::rollBack();
            return Redirect::back()->with('error', 'Erreur : ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Trip $trip)
    {
        try {
            $trip->stops()->delete();
            $trip->delete();
            return Redirect::route('trips.index')->with('success', 'Voyage supprimé avec succès.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Impossible de supprimer ce voyage.');
        }
    }
    public function show($id)
    {
        // On récupère le trajet avec toutes les relations nécessaires
        $trip = Trip::with([
            'route.departureCity',
            'route.arrivalCity',
            'bus',
            'tickets.user',      // si tu veux inclure l'utilisateur qui a réservé
        ])->findOrFail($id);
    
        // Préparer les données pour le frontend (optionnel : formater les arrêts)
        $tripData = [
            'id' => $trip->id,
            'departure_at' => $trip->departure_at,
            'arrival_at' => $trip->arrival_at,
            'base_price' => $trip->base_price,
            'seats_available' => $trip->seats_available,
            'bus' => $trip->bus,
            'route' => [
                'id' => $trip->route->id ?? null,
                'departureCity' => $trip->route->departureCity ?? null,
                'arrivalCity' => $trip->route->arrivalCity ?? null,
            ],
            'tickets' => $trip->tickets, // ou tu peux transformer selon besoin
            
        ];
    
        return Inertia::render('Trips/Show', [
            'trip' => $tripData,
        ]);
    }
    
}
