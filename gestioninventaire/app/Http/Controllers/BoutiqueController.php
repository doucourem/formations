<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BoutiqueController extends Controller
{
    // Liste des boutiques
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $sortField = $request->sort_field ?? 'id';
        $sortDirection = $request->sort_direction ?? 'asc';

        $boutiques = Boutique::orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->appends($request->all());

        return Inertia::render('Boutiques/Index', [
            'boutiques' => $boutiques,
            'filters' => [
                'per_page' => $perPage,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }

    // Formulaire création
    public function create()
    {
        return Inertia::render('Boutiques/BoutiqueForm');
    }

    // Enregistrement nouvelle boutique
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Boutique::create($request->only('name'));

        return redirect()->route('boutiques.index');
    }

    // Formulaire édition
    public function edit(Boutique $boutique)
    {
        return Inertia::render('Boutiques/BoutiqueForm', compact('boutique'));
    }

    // Mise à jour boutique
    public function update(Request $request, Boutique $boutique)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $boutique->update($request->only('name'));

        return redirect()->route('boutiques.index');
    }

    // Suppression boutique
    public function destroy(Boutique $boutique)
    {
        $boutique->delete();

        return redirect()->route('boutiques.index');
    }
}
