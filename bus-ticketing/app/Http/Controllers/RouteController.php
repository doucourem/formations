<?php

namespace App\Http\Controllers;

use App\Models\Route;
use App\Models\RouteStop;
use App\Models\City;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class RouteController extends Controller
{
    // Liste des routes
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 10);

        $routes = Route::with(['departureCity', 'arrivalCity'])
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();

        $routes->getCollection()->transform(function ($r) {
            $r->edit_url = route('busroutes.edit', $r->id);
            $r->departureCity = $r->departureCity ?? (object)['name' => '-'];
            $r->arrivalCity = $r->arrivalCity ?? (object)['name' => '-'];
            return $r;
        });

        return Inertia::render('Routes/Index', [
            'initialRoutes' => $routes,
            'initialFilters' => ['per_page' => $perPage],
        ]);
    }

    // Formulaire de création
    public function create()
    {
        $cities = City::orderBy('name')->get();

        return Inertia::render('Routes/Create', [
            'cities' => $cities,
        ]);
    }

    // Enregistrer une nouvelle route + stops
    public function store(Request $request)
    {
        $validated = $request->validate([
            'departure_city_id' => 'required|exists:cities,id|different:arrival_city_id',
            'arrival_city_id' => 'required|exists:cities,id',
            'distance' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'stops' => 'array',
            'stops.*.city_id' => 'required|exists:cities,id',
            'stops.*.to_city_id' => 'required|exists:cities,id',
            'stops.*.order' => 'required|integer|min:1',
            'stops.*.distance_from_start' => 'nullable|numeric|min:0',
            'stops.*.partial_price' => 'nullable|numeric|min:0',
        ]);

        DB::transaction(function () use ($validated) {
            // Créer la route principale
            $route = Route::create([
                'departure_city_id' => $validated['departure_city_id'],
                'arrival_city_id' => $validated['arrival_city_id'],
                'distance' => $validated['distance'],
                'price' => $validated['price'],
            ]);

            // Créer les arrêts s’ils existent
            if (!empty($validated['stops'])) {
                foreach ($validated['stops'] as $stop) {
                    RouteStop::create([
                        'route_id' => $route->id,
                        'city_id' => $stop['city_id'],
                        'to_city_id' => $stop['to_city_id'],
                        'order' => $stop['order'],
                        'distance_from_start' => $stop['distance_from_start'] ?? null,
                        'partial_price' => $stop['partial_price'] ?? null,
                    ]);
                }
            }
        });

        return redirect()->route('busroutes.index')->with('success', 'Itinéraire créé avec succès ✅');
    }

    // Formulaire d'édition
public function edit(\App\Models\Route $busroute)
{
    $cities = City::orderBy('name')->get();
    $busroute->load('stops.city');

    $stops = $busroute->stops->map(function ($stop, $index) {
        return [
            'id' => $stop->id,
            'city_id' => $stop->city_id,
             'to_city_id' => $stop->to_city_id,
            'order' => $stop->order ?? $index + 1,
            'distance_from_start' => $stop->distance_from_start ?? 0,
            'partial_price' => $stop->partial_price ?? 0,
        ];
    });

    return Inertia::render('Routes/Edit', [
        'routeData' => [
            'id' => $busroute->id,
            'departure_city_id' => $busroute->departure_city_id,
            'arrival_city_id' => $busroute->arrival_city_id,
            'distance' => $busroute->distance,
            'price' => $busroute->price,
            'stops' => $stops,
        ],
        'cities' => $cities,
    ]);
}



    // Mise à jour d'une route + stops
   public function update(Request $request, $id)
{
    $validated = $request->validate([
        'departure_city_id' => 'required|exists:cities,id|different:arrival_city_id',
        'arrival_city_id' => 'required|exists:cities,id',
        'distance' => 'required|numeric|min:0',
        'price' => 'required|numeric|min:0',
        'stops' => 'array',
        'stops.*.city_id' => 'required|exists:cities,id',
        'stops.*.to_city_id' => 'nullable|exists:cities,id', // ✅ ajouté
        'stops.*.order' => 'required|integer|min:1',
        'stops.*.distance_from_start' => 'nullable|numeric|min:0',
        'stops.*.partial_price' => 'nullable|numeric|min:0',
    ]);

    DB::transaction(function () use ($validated, $id) {
        $route = Route::findOrFail($id);

        // ✅ Met à jour uniquement les champs principaux, pas tout le tableau validé
        $route->update([
            'departure_city_id' => $validated['departure_city_id'],
            'arrival_city_id' => $validated['arrival_city_id'],
            'distance' => $validated['distance'],
            'price' => $validated['price'],
        ]);

        // Supprime les anciens arrêts
        $route->stops()->delete();

        // Recrée les arrêts
        if (!empty($validated['stops'])) {
            foreach ($validated['stops'] as $stop) {
                RouteStop::create([
                    'route_id' => $route->id,
                    'city_id' => $stop['city_id'],
                    'to_city_id' => $stop['to_city_id'] ?? null, // ✅ sécurisé
                    'order' => $stop['order'],
                    'distance_from_start' => $stop['distance_from_start'] ?? null,
                    'partial_price' => $stop['partial_price'] ?? null,
                ]);
            }
        }
    });

    return redirect()
        ->route('busroutes.index')
        ->with('success', 'Itinéraire mis à jour avec succès ✅');
}


    // Supprimer une route
    public function destroy(Route $route)
    {
        $route->delete();
        return redirect()->route('busroutes.index')->with('success', 'Itinéraire supprimé ✅');
    }
}
