<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Agency;
use App\Models\City;
use App\Models\Companies;

class AgencyController extends Controller
{
    /**
     * Liste des agences avec filtre par ville ou compagnie.
     */
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $cityId = $request->input('city_id');
        $companyId = $request->input('company_id');

        $agencies = Agency::with(['city', 'company'])
            ->withCount('tickets')
            ->when($cityId, fn($q) => $q->where('city_id', $cityId))
            ->when($companyId, fn($q) => $q->where('company_id', $companyId))
            ->orderBy('name')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn($agency) => [
                'id' => $agency->id,
                'name' => $agency->name,
                'city' => $agency->city?->name ?? '-',
                'company' => $agency->company?->name ?? '-',
                'tickets_sold' => $agency->tickets_count ?? 0,
                'created_at' => $agency->created_at?->toDateTimeString() ?? '',
                'updated_at' => $agency->updated_at?->toDateTimeString() ?? '',
            ]);

        $companies = Companies::select('id', 'name')->orderBy('name')->get();
        $cities = City::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Agencies/Index', [
            'agencies' => $agencies,
            'filters' => [
                'city_id' => $cityId,
                'company_id' => $companyId,
                'per_page' => $perPage,
            ],
            'companies' => $companies,
            'cities' => $cities,
        ]);
    }

    /**
     * Affiche le formulaire de création.
     */
    public function create()
    {
        $companies = Companies::select('id', 'name')->orderBy('name')->get();
        $cities = City::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Agencies/Create', [
            'companies' => $companies,
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
            'company_id' => ['required', 'exists:companies,id'],
            'city_id' => ['required', 'exists:cities,id'],
        ]);

        Agency::create($validated);

        return redirect()
            ->route('agencies.index')
            ->with('success', 'Agence créée avec succès.');
    }

    /**
     * Affiche le formulaire d'édition d'une agence.
     */
    public function edit(Agency $agency)
    {
        $companies = Companies::select('id', 'name')->orderBy('name')->get();
        $cities = City::select('id', 'name')->orderBy('name')->get();

        return Inertia::render('Agencies/Edit', [
            'agency' => [
                'id' => $agency->id,
                'name' => $agency->name,
                'company_id' => $agency->company_id,
                'city_id' => $agency->city_id,
            ],
            'companies' => $companies,
            'cities' => $cities,
        ]);
    }

    /**
     * Met à jour une agence existante.
     */
    public function update(Request $request, Agency $agency)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'company_id' => ['required', 'exists:companies,id'],
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
