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
     * Formulaire de création
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
     * Formulaire d'édition
     */
    public function edit(Trimestre $trimestre)
    {
        $trimestre->load('stocks', 'boutique');
        $produits = Produit::all();

        return Inertia::render('Trimestres/TrimestreForm', [
            'trimestre' => $trimestre,
            'boutique' => $trimestre->boutique,
            'produits' => $produits,
        ]);
    }

    /**
     * Enregistre un nouveau trimestre
     */
    public function store(Request $request, Boutique $boutique)
    {
        $data = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'cash_start' => 'required|numeric',
            'capital_start' => 'required|numeric',
            'stocks' => 'array',
            'stocks.*.produit_id' => 'required|exists:produits,id',
            'stocks.*.quantity_start' => 'numeric',
            'stocks.*.value_start' => 'numeric',
        ]);

        // Création du trimestre
        $trimestre = Trimestre::create([
            'boutique_id' => $boutique->id,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'cash_start' => $data['cash_start'],
            'capital_start' => $data['capital_start'],
            'cash_end' => $data['cash_start'],     // par défaut
            'capital_end' => $data['capital_start'], // par défaut
            'result' => 0,                          // initial
        ]);

        // Création des stocks
        foreach ($data['stocks'] as $s) {
            $trimestre->stocks()->create([
                'produit_id' => $s['produit_id'],
                'quantity_start' => $s['quantity_start'],
                'value_start' => $s['value_start'],
                'quantity_end' => $s['quantity_start'],
                'value_end' => $s['value_start'],
            ]);
        }

        return redirect()->route('boutiques.trimestres.index', $boutique->id);
    }

    /**
     * Mise à jour d'un trimestre
     */
    public function update(Request $request, Trimestre $trimestre)
    {
        $data = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'cash_start' => 'required|numeric',
            'capital_start' => 'required|numeric',
            'cash_end' => 'required|numeric',
            'capital_end' => 'required|numeric',
            'stocks' => 'array',
            'stocks.*.produit_id' => 'required|exists:produits,id',
            'stocks.*.quantity_start' => 'numeric',
            'stocks.*.value_start' => 'numeric',
            'stocks.*.quantity_end' => 'numeric',
            'stocks.*.value_end' => 'numeric',
        ]);

        // Update du trimestre
        $trimestre->update([
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'cash_start' => $data['cash_start'],
            'capital_start' => $data['capital_start'],
            'cash_end' => $data['cash_end'],
            'capital_end' => $data['capital_end'],
        ]);

        // Update / create stocks
        foreach ($data['stocks'] as $s) {
            $stock = $trimestre->stocks()->where('produit_id', $s['produit_id'])->first();
            if ($stock) {
                $stock->update([
                    'quantity_start' => $s['quantity_start'],
                    'value_start' => $s['value_start'],
                    'quantity_end' => $s['quantity_end'],
                    'value_end' => $s['value_end'],
                ]);
            } else {
                $trimestre->stocks()->create([
                    'produit_id' => $s['produit_id'],
                    'quantity_start' => $s['quantity_start'],
                    'value_start' => $s['value_start'],
                    'quantity_end' => $s['quantity_end'],
                    'value_end' => $s['value_end'],
                ]);
            }
        }

        // Calcul automatique du résultat
        $totalStockStart = $trimestre->stocks->sum(fn($s) => $s->quantity_start * $s->value_start);
        $totalStockEnd = $trimestre->stocks->sum(fn($s) => $s->quantity_end * $s->value_end);

        // Depenses
    $trimestre->depenses()->delete(); // on supprime les anciennes lignes
    foreach ($request->depenses as $d) {
        $trimestre->depenses()->create($d);
    }

    // Crédits
    $trimestre->credits()->delete();
    foreach ($request->credits as $c) {
        $trimestre->credits()->create($c);
    }

    // Calcul automatique du résultat
    $totalStockStart = $trimestre->stocks->sum(fn($s) => $s->quantity_start * $s->value_start);
    $totalStockEnd   = $trimestre->stocks->sum(fn($s) => $s->quantity_end * $s->value_end);
    $totalDepenses   = $trimestre->depenses->sum('amount');
    $totalCredits    = $trimestre->credits->sum('amount');

    $trimestre->update([
        'result' => ($trimestre->cash_end + $trimestre->capital_end + $totalStockEnd + $totalCredits)
                     - ($trimestre->cash_start + $trimestre->capital_start + $totalStockStart + $totalDepenses),
    ]);

        return redirect()->route('boutiques.trimestres.index', $trimestre->boutique_id);
    }

    public function show(Trimestre $trimestre)
{
    $trimestre->load('stocks.produit', 'boutique'); // charger stocks et produit lié
    return Inertia::render('Trimestres/TrimestreDetails', [
        'trimestre' => $trimestre,
    ]);
}

}
