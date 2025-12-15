<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProduitController extends Controller
{
    public function index()
    {
        $produits = Produit::with('boutiques')->latest()->get();

        return inertia('Produits/Index', [
            'produits' => $produits
        ]);
    }

    public function create()
    {
        return inertia('Produits/ProduitForm', [
            'produit' => null,
            'boutiques' => Boutique::all(), // 👈 important
        ]);
    }

   public function store(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'sale_price' => 'required|numeric|min:0',
        'photo' => 'nullable|image|max:10240',
        'boutiques' => 'nullable|array',        // 👈 plus obligatoire
        'boutiques.*' => 'exists:boutiques,id',
    ]);

    $produit = Produit::create([
        'name' => $request->name,
        'sale_price' => $request->sale_price,
    ]);

    // Associer seulement si boutiques envoyées
    if (!empty($request->boutiques)) {
        $produit->boutiques()->sync($request->boutiques);
    }

    // Upload de la photo
    if ($request->hasFile('photo')) {
        $path = $request->photo->store('produits', 'public');
        $produit->update(['photo' => $path]);
    }

    return redirect()->route('produits.index');
}


    public function edit(Produit $produit)
    {
        return inertia('Produits/ProduitForm', [
            'produit' => $produit->load('boutiques'), // 👈 charger relations existantes
            'boutiques' => Boutique::all(),           // 👈 pour afficher le multi-select
        ]);
    }
public function update(Request $request, Produit $produit)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'sale_price' => 'required|numeric|min:0',
        'photo' => 'nullable|image|max:10240',
        'boutiques' => 'nullable|array',
        'boutiques.*' => 'integer|exists:boutiques,id',
    ]);

    $produit->update([
        'name' => $request->name,
        'sale_price' => $request->sale_price,
    ]);

    // Sync sécurisé
    $produit->boutiques()->sync($request->boutiques ?? []);

    if ($request->hasFile('photo')) {
        if ($produit->photo) {
            Storage::disk('public')->delete($produit->photo);
        }

        $path = $request->file('photo')->store('produits', 'public');
        $produit->update(['photo' => $path]);
    }

    return redirect()->route('produits.index')->with('success', 'Produit mis à jour');
}


    public function destroy(Produit $produit)
    {
        if ($produit->photo) {
            Storage::disk('public')->delete($produit->photo);
        }

        $produit->boutiques()->detach(); // 👈 important : nettoyer relation pivot
        $produit->delete();

        return redirect()->route('produits.index');
    }
}
