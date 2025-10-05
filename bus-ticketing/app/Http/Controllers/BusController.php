<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Bus;
use App\Models\Agency;

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
            ->withQueryString()
            ->through(fn($bus) => [
                'id' => $bus->id,
                'registration_number' => $bus->registration_number,
                'model' => $bus->model,
                'capacity' => $bus->capacity,
                'status' => $bus->status,
                'agency' => $bus->agency?->name ?? '-',
                'created_at' => $bus->created_at?->toDateTimeString() ?? '',
                'updated_at' => $bus->updated_at?->toDateTimeString() ?? '',
            ]);

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
        $agencies = Agency::select('id', 'name')->get();
    
        return Inertia::render('Buses/Create', [
            'agencies' => $agencies,
        ]);
    }
    
    public function edit(Bus $bus)
    {
        $bus->load('agency');

        return Inertia::render('Buses/Edit', [
            'bus' => [
                'id' => $bus->id,
                'registration_number' => $bus->registration_number,
                'model' => $bus->model,
                'capacity' => $bus->capacity,
                'status' => $bus->status,
                'agency_id' => $bus->agency_id,
                'agency' => $bus->agency?->name ?? '',
            ],
        ]);
    }

    /**
     * Store a newly created bus in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'registration_number' => ['required', 'string', 'max:50', 'unique:buses,registration_number'],
            'model' => ['required', 'string', 'max:255'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:active,inactive,maintenance'],
            'agency_id' => ['required', 'exists:agencies,id'],
        ]);

        Bus::create($validated);

        return redirect()
            ->route('buses.index')
            ->with('success', 'Bus créé avec succès.');
    }

    /**
     * Update the specified bus in storage.
     */
    public function update(Request $request, Bus $bus)
    {
        $validated = $request->validate([
            'registration_number' => ['required', 'string', 'max:50', 'unique:buses,registration_number,' . $bus->id],
            'model' => ['required', 'string', 'max:255'],
            'capacity' => ['required', 'integer', 'min:1'],
            'status' => ['required', 'in:active,inactive,maintenance'],
            'agency_id' => ['required', 'exists:agencies,id'],
        ]);

        $bus->update($validated);

        return redirect()
            ->route('buses.index')
            ->with('success', 'Bus mis à jour avec succès.');
    }

    /**
     * Optionnel : suppression d’un bus
     */
    public function destroy(Bus $bus)
    {
        $bus->delete();

        return redirect()
            ->route('buses.index')
            ->with('success', 'Bus supprimé avec succès.');
    }
}
