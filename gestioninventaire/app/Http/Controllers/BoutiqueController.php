<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BoutiqueController extends Controller
{
    // Affichage de la liste des boutiques
    public function index()
    {
        $boutiques = Boutique::latest()->get();

        return Inertia::render('Boutiques/Index', [
            'boutiques' => $boutiques
        ]);
    }

    // Formulaire de création
    public function create()
    {
        return Inertia::render('Boutiques/BoutiqueForm', [
            'boutique' => null
        ]);
    }

    // Stockage d'une nouvelle boutique
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'description' => 'nullable|string',
        ]);

        Boutique::create($request->only([
            'name',
            'adresse',
            'telephone',
            'email',
            'description',
        ]));

        return redirect()->route('boutiques.index');
    }

    // Formulaire d'édition
    public function edit(Boutique $boutique)
    {
        return Inertia::render('Boutiques/BoutiqueForm', [
            'boutique' => $boutique
        ]);
    }

    // Mise à jour d'une boutique
    public function update(Request $request, Boutique $boutique)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'adresse' => 'nullable|string|max:255',
            'telephone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
            'description' => 'nullable|string',
        ]);

        $boutique->update($request->only([
            'name',
            'adresse',
            'telephone',
            'email',
            'description',
        ]));

        return redirect()->route('boutiques.index');
    }

    // Suppression d'une boutique
    public function destroy(Boutique $boutique)
    {
        $boutique->delete();

        return redirect()->route('boutiques.index');
    }
}
