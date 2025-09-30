<?php

namespace App\Http\Controllers;

use App\Models\Route;
use App\Models\City;
use Illuminate\Http\Request;
use Inertia\Inertia;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);
    
        $routes = Route::with(['departureCity', 'arrivalCity'])
            ->orderBy('id')
            ->paginate($perPage)
            ->withQueryString();
    
        // Générer l'URL d'édition pour chaque route
        $routes->getCollection()->transform(function ($r) {
            $r->edit_url = route('routes.edit', $r->id);
            return $r;
        });
    
        return Inertia::render('Routes/Index', [
            'initialRoutes' => $routes,
            'initialFilters' => [
                'per_page' => $perPage,
            ],
        ]);
    }
    


    public function create()
    {
        $cities = City::orderBy('name')->get();
        return Inertia::render('Routes/Create', [
            'cities' => $cities,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'departure_city_id' => 'required|exists:cities,id',
            'arrival_city_id' => 'required|exists:cities,id|different:departure_city_id',
        ]);

        Route::create($data);

        return redirect()->route('routes.index')->with('success', 'Route créée avec succès ✅');
    }
}
