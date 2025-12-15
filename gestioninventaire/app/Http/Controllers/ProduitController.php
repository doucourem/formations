<?php

namespace App\Http\Controllers;

use App\Models\Produit;
use App\Models\Boutique;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class ProduitController extends Controller
{
    // Liste des produits
    public function index()
    {
        $produits = Produit::with('boutiques')->latest()->get();

        return Inertia::render('Produits/Index', compact('produits'));
    }

    // Formulaire création
    public function create()
    {
        $boutiques = Boutique::all();

        return Inertia::render('Produits/ProduitForm', [
            'produit' => null,
            'boutiques' => $boutiques,
        ]);
    }

    // Enregistrement nouveau produit
    public function store(Request $request)
    {
        $data = $this->validateData($request);

        $produit = Produit::create($data);

        // Sync boutiques si présentes
        if (!empty($data['boutiques'])) {
            $produit->boutiques()->sync($data['boutiques']);
        }

        // Gestion photo
        $this->handlePhotoUpload($request, $produit);

        return redirect()->route('produits.index')
            ->with('success', 'Produit créé !');
    }

    // Formulaire édition
    public function edit(Produit $produit)
    {
        $boutiques = Boutique::all();

        return Inertia::render('Produits/ProduitForm', [
            'produit' => $produit->load('boutiques'),
            'boutiques' => $boutiques,
        ]);
    }

    // Mise à jour produit
    public function update(Request $request, Produit $produit)
    {
        $data = $this->validateData($request);

        $produit->update($data);

        $produit->boutiques()->sync($data['boutiques'] ?? []);

        $this->handlePhotoUpload($request, $produit);

        return redirect()->route('produits.index')
            ->with('success', 'Produit mis à jour !');
    }

    // Suppression produit
    public function destroy(Produit $produit)
    {
        // Supprime l'image si existe
        if ($produit->photo) {
            Storage::disk('public')->delete($produit->photo);
        }

        $produit->boutiques()->detach();
        $produit->delete();

        return redirect()->route('produits.index')
            ->with('success', 'Produit supprimé !');
    }

    // Validation commune store/update
    protected function validateData(Request $request): array
    {
        return $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'sale_price' => 'required|numeric|min:0',
            'photo' => 'nullable|image|max:10240',
            'boutiques' => 'nullable|array',
            'boutiques.*' => 'exists:boutiques,id',
        ]);
    }

    // Gestion de l'upload photo
    protected function handlePhotoUpload(Request $request, Produit $produit): void
    {
        if ($request->hasFile('photo')) {
            // Supprime ancienne photo si existante
            if ($produit->photo) {
                Storage::disk('public')->delete($produit->photo);
            }

            $path = $request->photo->store('produits', 'public');
            $produit->update(['photo' => $path]);
        }
    }
}
