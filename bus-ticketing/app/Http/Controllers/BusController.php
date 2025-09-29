<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Bus;

class BusController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 20);
        $agencyId = $request->input('agency_id');

        $buses = Bus::with('agency')
                    ->when($agencyId, fn($q) => $q->where('agency_id', $agencyId))
                    ->orderBy('model')
                    ->paginate($perPage)
                    ->withQueryString();

        return Inertia::render('Buses/Index', [
            'buses' => $buses,
            'filters' => [
                'agency_id' => $agencyId,
                'per_page' => $perPage,
            ],
        ]);
    }

    public function create()
    {
        return Inertia::render('Buses/Create');
    }

    public function edit(Bus $bus)
    {
        $bus->load('agency');
        return Inertia::render('Buses/Edit', [
            'bus' => $bus
        ]);
    }
}
