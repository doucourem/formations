<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Agency;

class AgencyController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $cityId = $request->input('city_id');

        $agencies = Agency::with('city')
    ->when($cityId, fn($q) => $q->where('city_id', $cityId))
    ->orderBy('name')
    ->paginate($perPage)
    ->withQueryString()
    ->through(fn($agency) => [
        'id' => $agency->id,
        'name' => $agency->name,
        'city' => $agency->city?->name ?? '-', 
        'created_at' => $agency->created_at?->toDateTimeString() ?? '',
        'updated_at' => $agency->updated_at?->toDateTimeString() ?? '',
    ]);


        return Inertia::render('Agencies/Index', [
            'agencies' => $agencies,
            'filters' => [
                'city_id' => $cityId,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Agencies/Create');
    }

    public function edit(Agency $agency)
    {
        $agency->load('city');

        return Inertia::render('Agencies/Edit', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'city' => $agency->city?->name ?? '',
                'city_id' => $agency->city_id,
            ],
        ]);
    }
}
