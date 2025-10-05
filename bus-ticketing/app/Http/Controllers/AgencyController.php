<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Agency;
use App\Models\City;

class AgencyController extends Controller
{
    /**
     * Liste des agences avec filtre par ville.
     */
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

    /**
     * Affiche le formulaire de création avec la liste des villes.
     */
    public function create()
    {
        $cities = City::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Agencies/Create', [
            'cities' => $cities,
        ]);
    }

    /**
     * Affiche le formulaire d'édition d'une agence.
     */
    public function edit(Agency $agency)
    {
        $cities = City::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Agencies/Edit', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'city_id' => $agency->city_id,
            ],
            'cities' => $cities,
        ]);
    }

    /**
     * Stocke une nouvelle agence.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'city_id' => ['required', 'exists:cities,id'],
        ]);

        Agency::create($validated);

        return redirect()
            ->route('agencies.index')
            ->with('success', 'Agence créée avec succès.');
    }

    /**
     * Met à jour une agence existante.
     */
    public function update(Request $request, Agency $agency)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'city_id' => ['required', 'exists:cities,id'],
        ]);

        $agency->update($validated);

        return redirect()
            ->route('agencies.index')
            ->with('success', 'Agence mise à jour avec succès.');
    }

    /**
     * Supprime une agence.
     */
    public function destroy(Agency $agency)
    {
        $agency->delete();

        return redirect()
            ->route('agencies.index')
            ->with('success', 'Agence supprimée avec succès.');
    }
}
