<?php

namespace App\Http\Controllers;

use App\Models\Route;
use App\Models\City;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RouteController extends Controller
{
    // Afficher la liste des routes
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);

        $routes = Route::with(['departureCity', 'arrivalCity'])
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();

        // Générer l'URL d'édition et s'assurer que les villes ne sont pas null
        $routes->getCollection()->transform(function ($r) {
            $r->edit_url = route('routes.edit', $r->id);
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

    // Stocker une nouvelle route
    public function store(Request $request)
    {
        $data = $request->validate([
            'departure_city_id' => 'required|exists:cities,id',
            'arrival_city_id' => 'required|exists:cities,id|different:departure_city_id',
            'distance' => 'nullable|numeric|min:0',
        ]);

        Route::create($data);

        return redirect()->route('routes.index')->with('success', 'Route créée avec succès ✅');
    }

    // Formulaire d'édition
    public function edit(Route $route)
    {
        $cities = City::orderBy('name')->get();

        return Inertia::render('Routes/Edit', [
            'routeData' => $route,
            'cities' => $cities,
        ]);
    }

    // Mettre à jour une route
    public function update(Request $request, Route $route)
    {
        $data = $request->validate([
            'departure_city_id' => 'required|exists:cities,id',
            'arrival_city_id' => 'required|exists:cities,id|different:departure_city_id',
            'distance' => 'nullable|numeric|min:0',
        ]);

        $route->update($data);

        return redirect()->route('routes.index')->with('success', 'Route mise à jour avec succès ✅');
    }

    // Supprimer une route
    public function destroy(Route $route)
    {
        $route->delete();
        return redirect()->route('routes.index')->with('success', 'Route supprimée ✅');
    }
}
