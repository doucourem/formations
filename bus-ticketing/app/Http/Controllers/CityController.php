<?php

namespace App\Http\Controllers;

use App\Models\City;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CityController extends Controller
{
    /**
     * Affiche la liste des villes avec pagination.
     */
   
public function index()
{
    $cities = City::orderBy('name')->paginate(
        request('per_page', 10)
    );

    return Inertia::render('Cities/Index', [
        'cities' => $cities,
        'filters' => [
            'search' => request('search', ''),
            'sort_field' => request('sort_field', 'id'),
            'sort_direction' => request('sort_direction', 'asc'),
            'per_page' => request('per_page', 10),
        ],
    ]);
}

    /**
     * Affiche le formulaire de création d'une ville.
     */
    public function create()
    {
        return Inertia::render('Cities/Create');
    }

    /**
     * Stocke une nouvelle ville en base.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|unique:cities,name',
            'code' => 'nullable|string|max:10', // exemple si tu as un code
        ]);

        City::create($data);

        return redirect()->route('cities.index')
                         ->with('success', 'Ville créée avec succès ✅');
    }

    /**
     * Affiche le formulaire d'édition d'une ville.
     */
    public function edit(City $city)
    {
        return Inertia::render('Cities/Edit', [
            'city' => $city, // accessible en props côté React
        ]);
    }

    /**
     * Met à jour une ville existante.
     */
    public function update(Request $request, City $city)
    {
        $data = $request->validate([
            'name' => 'required|unique:cities,name,' . $city->id,
            'code' => 'nullable|string|max:10',
        ]);

        $city->update($data);

        return redirect()->route('cities.index')
                         ->with('success', 'Ville mise à jour avec succès ✅');
    }

    /**
     * Supprime une ville.
     */
    public function destroy(City $city)
    {
        $city->delete();

        return redirect()->route('cities.index')
                         ->with('success', 'Ville supprimée avec succès ✅');
    }
}
