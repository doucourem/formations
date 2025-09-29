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
                          ->withQueryString();

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
            'agency' => $agency
        ]);
    }
}
