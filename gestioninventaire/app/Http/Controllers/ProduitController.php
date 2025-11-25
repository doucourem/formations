<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProduitController extends Controller
{
    public function index()
    {
        $produits = Produit::latest()->get();

        return inertia('Produits/Index', [
            'produits' => $produits
        ]);
    }

    public function create()
    {
        return inertia('Produits/ProduitForm', [
            'produit' => null,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sale_price' => 'required|numeric|min:0',
            'photo' => 'nullable|image|max:2048',
        ]);

        $produit = Produit::create([
            'name' => $request->name,
            'sale_price' => $request->sale_price,
        ]);

        if ($request->hasFile('photo')) {
            $path = $request->photo->store('produits', 'public');
            $produit->update(['photo' => $path]);
        }

        return redirect()->route('produits.index');
    }

    public function edit(Produit $produit)
    {
        return inertia('Produits/ProduitForm', [
            'produit' => $produit
        ]);
    }

    public function update(Request $request, Produit $produit)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'sale_price' => 'required|numeric|min:0',
            'photo' => 'nullable|image|max:2048',
        ]);

        $produit->update([
            'name' => $request->name,
            'sale_price' => $request->sale_price,
        ]);

        // Remplacement image
        if ($request->hasFile('photo')) {

            if ($produit->photo) {
                Storage::disk('public')->delete($produit->photo);
            }

            $path = $request->photo->store('produits', 'public');
            $produit->update(['photo' => $path]);
        }

        return redirect()->route('produits.index');
    }

    public function destroy(Produit $produit)
    {
        if ($produit->photo) {
            Storage::disk('public')->delete($produit->photo);
        }

        $produit->delete();

        return redirect()->route('produits.index');
    }
}
