<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Route;

class RouteController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);

        $routes = Route::with(['departureCity','arrivalCity'])
                       ->orderBy('departure_city_id')
                       ->paginate($perPage)
                       ->withQueryString();

        return Inertia::render('Routes/Index', [
            'routes' => $routes,
            'filters' => [
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Routes/Create');
    }

    public function edit(Route $route)
    {
        $route->load(['departureCity','arrivalCity']);
        return Inertia::render('Routes/Edit', [
            'route' => $route
        ]);
    }
}
