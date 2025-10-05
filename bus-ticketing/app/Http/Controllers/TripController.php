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
        $routes = TripRoute::with(['departureCity:id,name', 'arrivalCity:id,name'])
            ->get()
            ->map(fn($route) => [
                'id' => $route->id,
                'departure_city' => $route->departureCity->name ?? '-',
                'arrival_city' => $route->arrivalCity->name ?? '-',
            ]);

        $buses = Bus::select('id', 'name', 'capacity')->get();

        return Inertia::render('Trips/Create', [
            'routes' => $routes,
            'buses' => $buses,
        ]);
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'route_id' => ['required', 'exists:routes,id'],
                'bus_id' => ['required', 'exists:buses,id'],
                'departure_at' => ['required', 'date', 'after_or_equal:today'],
                'arrival_at' => ['required', 'date', 'after:departure_at'],
                'base_price' => ['required', 'numeric', 'min:0'],
                'seats_available' => ['required', 'integer', 'min:0'],
                'stops' => ['nullable', 'array'],
            ]);

            Trip::create($validated);

            return Redirect::route('trips.index')
                ->with('success', 'Voyage créé avec succès.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return Redirect::back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return Redirect::back()
                ->with('error', 'Une erreur est survenue lors de la création du voyage.')
                ->withInput();
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

        $tripData = [
            'id' => $trip->id,
            'route_id' => $trip->route_id,
            'bus_id' => $trip->bus_id,
            'departure_at' => $trip->departure_at ? Carbon::parse($trip->departure_at)->format('Y-m-d\TH:i') : '',
            'arrival_at' => $trip->arrival_at ? Carbon::parse($trip->arrival_at)->format('Y-m-d\TH:i') : '',
            'base_price' => $trip->base_price,
            'seats_available' => $trip->seats_available,
            'stops' => $trip->stops ?? [''],
        ];

        return Inertia::render('Trips/Edit', [
            'trip' => $tripData,
            'routes' => $routes,
            'buses' => $buses,
        ]);
    }

    public function update(Request $request, Trip $trip)
    {
        try {
            $validated = $request->validate([
                'route_id' => ['required', 'exists:routes,id'],
                'bus_id' => ['required', 'exists:buses,id'],
                'departure_at' => ['required', 'date', 'after_or_equal:today'],
                'arrival_at' => ['required', 'date', 'after:departure_at'],
                'base_price' => ['required', 'numeric', 'min:0'],
                'seats_available' => ['required', 'integer', 'min:0'],
                'stops' => ['nullable', 'array'],
            ]);

            $trip->update($validated);

            return Redirect::route('trips.index')
                ->with('success', 'Voyage mis à jour avec succès.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return Redirect::back()
                ->withErrors($e->errors())
                ->withInput();
        } catch (\Exception $e) {
            return Redirect::back()
                ->with('error', 'Une erreur est survenue lors de la mise à jour du voyage.')
                ->withInput();
        }
    }

    public function destroy(Trip $trip)
    {
        try {
            $trip->delete();
            return Redirect::route('trips.index')
                ->with('success', 'Voyage supprimé avec succès.');
        } catch (\Exception $e) {
            return Redirect::back()
                ->with('error', 'Impossible de supprimer ce voyage.');
        }
    }
}
