<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProduitController extends Controller
{
    // Liste des produits
    public function index(Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $sortField = $request->sort_field ?? 'id';
        $sortDirection = $request->sort_direction ?? 'asc';

        $produits = Produit::orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->appends($request->all());

        return Inertia::render('Produits/Index', [
            'produits' => $produits,
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
        return Inertia::render('Produits/ProduitForm');
    }

    // Enregistrement nouveau produit
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        Produit::create($request->only('name'));

        return redirect()->route('produits.index');
    }

    // Formulaire édition
    public function edit(Produit $produit)
    {
        return Inertia::render('Produits/ProduitForm', compact('produit'));
    }

    // Mise à jour produit
    public function update(Request $request, Produit $produit)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $produit->update($request->only('name'));

        return redirect()->route('produits.index');
    }

    // Suppression produit
    public function destroy(Produit $produit)
    {
        $produit->delete();

        return redirect()->route('produits.index');
    }
}
