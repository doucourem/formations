<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use App\Models\Trimestre;
use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TrimestreController extends Controller
{
    /**
     * Affiche le formulaire de création d'un trimestre pour une boutique.
     */
    public function create(Boutique $boutique)
    {
        $produits = Produit::all();

        return Inertia::render('Trimestres/TrimestreForm', [
            'boutique' => $boutique,
            'produits' => $produits,
        ]);
    }

    /**
     * Affiche le formulaire d'édition d'un trimestre.
     */
    public function edit(Trimestre $trimestre)
    {
        $produits = Produit::all();
        $trimestre->load('stocks');
        $boutique = $trimestre->boutique;

        return Inertia::render('Trimestres/TrimestreForm', [
            'trimestre' => $trimestre,
            'produits' => $produits,
            'boutique' => $boutique,
        ]);
    }

    /**
     * Enregistre un nouveau trimestre.
     */
    public function store(Request $request, Boutique $boutique)
    {
        $trimestre = Trimestre::create($request->only([
            'start_date',
            'end_date',
            'cash_start',
            'capital_start'
        ]));

        foreach ($request->stocks as $s) {
            $trimestre->stocks()->create($s);
        }

        return redirect()->route('boutiques.trimestres.index', $boutique->id);
    }

    /**
     * Met à jour un trimestre existant.
     */
    public function update(Request $request, Trimestre $trimestre)
    {
        $trimestre->update($request->only([
            'start_date',
            'end_date',
            'cash_start',
            'capital_start'
        ]));

        foreach ($request->stocks as $s) {
            $stock = $trimestre->stocks()->where('produit_id', $s['produit_id'])->first();
            if ($stock) {
                $stock->update($s);
            } else {
                $trimestre->stocks()->create($s);
            }
        }

        return redirect()->route('boutiques.trimestres.index', $trimestre->boutique_id);
    }
}
