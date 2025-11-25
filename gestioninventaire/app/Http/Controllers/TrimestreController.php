<?php

namespace App\Http\Controllers;

use App\Models\Boutique;
use App\Models\Trimestre;
use App\Models\Produit;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB; // Ajouté pour les transactions
use Barryvdh\DomPDF\Facade\Pdf;

class TrimestreController extends Controller
{
    /**
     * Liste des trimestres d'une boutique (avec pagination et tri)
     */
    public function index(Boutique $boutique, Request $request)
    {
        $perPage = $request->per_page ?? 10;
        $sortField = $request->sort_field ?? 'id';
        $sortDirection = $request->sort_direction ?? 'desc';

        // Chargement initial des trimestres paginés
        $trimestres = Trimestre::query()
            ->where('boutique_id', $boutique->id)
            ->orderBy($sortField, $sortDirection)
            ->paginate($perPage)
            ->appends($request->all());

        // Eager loading des relations nécessaires pour les résultats affichés
        $trimestres->load('stocks.produit');

        return Inertia::render('Trimestres/Index', [
            'boutique' => $boutique,
            'trimestres' => $trimestres,
            'filters' => [
                'per_page' => $perPage,
                'sort_field' => $sortField,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }




public function exportPdf(Trimestre $trimestre)
{
    $trimestre->load(['stocks.produit', 'depenses', 'credits', 'boutique']);

    $pdf = Pdf::loadView('trimestres.pdf', compact('trimestre'))
              ->setPaper('a4', 'portrait');

    return $pdf->download("bilan_trimestre_{$trimestre->id}.pdf");
}

    /**
     * Formulaire de création
     */
    public function create(Boutique $boutique)
    {
        // Seules les colonnes nécessaires sont chargées pour optimiser la mémoire
        $produits = Produit::select('id', 'name')->get(); 
        
        return Inertia::render('Trimestres/TrimestreFormFinal', [
            'boutique' => $boutique,
            'produits' => $produits,
        ]);
    }

    /**
     * Formulaire d'édition
     */
    public function edit(Trimestre $trimestre)
    {
        // Chargement des relations nécessaires, y compris les dépense et crédits pour l'édition
        $trimestre->load('stocks.produit', 'boutique', 'depenses', 'credits'); 
        
        // Seules les colonnes nécessaires sont chargées
        $produits = Produit::select('id', 'name')->get(); 

        return Inertia::render('Trimestres/TrimestreFormFinal', [
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
    return DB::transaction(function () use ($request, $boutique) {
        
        $data = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'cash_start' => 'required|numeric',
            'capital_start' => 'required|numeric',

            // Stocks
            'stocks' => 'nullable|array',
            'stocks.*.produit_id' => 'required|exists:produits,id',
            'stocks.*.quantity_start' => 'nullable|numeric',
            'stocks.*.value_start' => 'nullable|numeric',

            // Dépenses et crédits
            'depenses' => 'nullable|array',
            'depenses.*.amount' => 'required_with:depenses|numeric',
            'depenses.*.description' => 'nullable|string',

            'credits' => 'nullable|array',
            'credits.*.amount' => 'required_with:credits|numeric',
            'credits.*.description' => 'nullable|string',

            // Correction: cash_end et capital_end
            'cash_end' => 'nullable|numeric',
            'capital_end' => 'nullable|numeric',
        ]);

        // Création du trimestre
        $trimestre = Trimestre::create([
            'boutique_id' => $boutique->id,
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'cash_start' => $data['cash_start'],
            'capital_start' => $data['capital_start'],
            'cash_end' => $data['cash_end'] ?? $data['cash_start'], 
            'capital_end' => $data['capital_end'] ?? $data['capital_start'], 
            'result' => 0, 
        ]);

        // Création des stocks
        if (isset($data['stocks'])) {
            foreach ($data['stocks'] as $s) {
                $trimestre->stocks()->create([
                    'produit_id' => $s['produit_id'],
                    'quantity_start' => $s['quantity_start'] ?? 0,
                    'value_start' => $s['value_start'] ?? 0,
                    'quantity_end' => $s['quantity_start'] ?? 0,
                    'value_end' => $s['value_start'] ?? 0,
                ]);
            }
        }

        // Création des dépenses
        if (isset($data['depenses'])) {
            $trimestre->depenses()->createMany($data['depenses']);
        }

        // Création des crédits
        if (isset($data['credits'])) {
            $trimestre->credits()->createMany($data['credits']);
        }

        // Recalculer le résultat si nécessaire
        // $trimestre->calculateResult();

        return redirect()->route('boutiques.trimestres.index', $boutique->id)
            ->with('success', 'Trimestre créé avec succès.');
    });
}


    /**
     * Mise à jour d'un trimestre
     */
    public function update(Request $request, Trimestre $trimestre)
{
    return DB::transaction(function () use ($request, $trimestre) {
        // 1️⃣ Validation
        $data = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'required|date|after_or_equal:start_date',
            'cash_start' => 'required|numeric',
            'capital_start' => 'required|numeric',
            'cash_end' => 'required|numeric',
            'capital_end' => 'required|numeric',

            // Stocks
            'stocks' => 'nullable|array',
            'stocks.*.id' => 'sometimes|exists:stocks,id',
            'stocks.*.produit_id' => 'required|exists:produits,id',
            'stocks.*.quantity_start' => 'nullable|numeric',
            'stocks.*.value_start' => 'nullable|numeric',
            'stocks.*.quantity_end' => 'nullable|numeric',
            'stocks.*.value_end' => 'nullable|numeric',

            // Dépenses et crédits
            'depenses' => 'nullable|array',
            'depenses.*.description' => 'required_with:depenses|string',
            'depenses.*.amount' => 'required_with:depenses|numeric',
            'credits' => 'nullable|array',
            'credits.*.description' => 'required_with:credits|string',
            'credits.*.amount' => 'required_with:credits|numeric',
        ]);

        // 2️⃣ Update du Trimestre
        $trimestre->update([
            'start_date' => $data['start_date'],
            'end_date' => $data['end_date'],
            'cash_start' => $data['cash_start'],
            'capital_start' => $data['capital_start'],
            'cash_end' => $data['cash_end'],
            'capital_end' => $data['capital_end'],
        ]);

        // 3️⃣ Gestion des stocks
        $stocksToSync = collect($data['stocks'] ?? [])->map(function ($s) {
            return [
                'produit_id' => $s['produit_id'],
                'quantity_start' => $s['quantity_start'] ?? 0,
                'value_start' => $s['value_start'] ?? 0,
                'quantity_end' => $s['quantity_end'] ?? 0,
                'value_end' => $s['value_end'] ?? 0,
            ];
        })->toArray();

        $currentStockIds = $trimestre->stocks->pluck('id');
        $updatedStockIds = [];

        foreach ($stocksToSync as $s) {
            $stock = $trimestre->stocks()->where('produit_id', $s['produit_id'])->first();
            if ($stock) {
                $stock->update($s);
                $updatedStockIds[] = $stock->id;
            } else {
                $newStock = $trimestre->stocks()->create($s);
                $updatedStockIds[] = $newStock->id;
            }
        }

        // Supprimer les stocks retirés
        $toDelete = $currentStockIds->diff($updatedStockIds);
        if ($toDelete->isNotEmpty()) {
            $trimestre->stocks()->whereIn('id', $toDelete)->delete();
        }

        // 4️⃣ Gestion des Dépenses
        $trimestre->depenses()->delete();
        if (isset($data['depenses'])) {
            $depenses = collect($data['depenses'])->map(function($d){
                return [
                    'description' => $d['description'] ?? 'Sans description',
                    'amount' => $d['amount'] ?? 0
                ];
            })->toArray();
            $trimestre->depenses()->createMany($depenses);
        }

        // 5️⃣ Gestion des Crédits
        $trimestre->credits()->delete();
        if (isset($data['credits'])) {
            $credits = collect($data['credits'])->map(function($c){
                return [
                    'description' => $c['description'] ?? 'Sans description',
                    'amount' => $c['amount'] ?? 0
                ];
            })->toArray();
            $trimestre->credits()->createMany($credits);
        }

        // 6️⃣ Recalculer le résultat
        $trimestre->load('stocks', 'depenses', 'credits');

        $totalStockStart = $trimestre->stocks->sum(fn($s) => $s->quantity_start * $s->value_start);
        $totalStockEnd = $trimestre->stocks->sum(fn($s) => $s->quantity_end * $s->value_end);
        $totalDepenses = $trimestre->depenses->sum('amount');
        $totalCredits = $trimestre->credits->sum('amount');

        $result = ($trimestre->cash_end + $trimestre->capital_end + $totalStockEnd + $totalCredits)
                  - ($trimestre->cash_start + $trimestre->capital_start + $totalStockStart + $totalDepenses);

        $trimestre->update(['result' => $result]);

        return redirect()->route('boutiques.trimestres.index', $trimestre->boutique_id)
            ->with('success', 'Trimestre mis à jour avec succès.');
    });
}


    /**
     * Calcule le résultat financier du trimestre.
     * @param Trimestre $trimestre
     * @return float
     */
    protected function calculateTrimestreResult(Trimestre $trimestre): float
    {
        // On s'assure que les relations sont chargées
        $trimestre->loadMissing('stocks', 'depenses', 'credits');
        
        $totalStockStart = $trimestre->stocks->sum(fn($s) => $s->quantity_start * $s->value_start);
        $totalStockEnd   = $trimestre->stocks->sum(fn($s) => $s->quantity_end * $s->value_end);
        $totalDepenses   = $trimestre->depenses->sum('amount');
        $totalCredits    = $trimestre->credits->sum('amount');
        
        $initialAssets = $trimestre->cash_start + $trimestre->capital_start + $totalStockStart;
        $finalAssets = $trimestre->cash_end + $trimestre->capital_end + $totalStockEnd;
        
        // Formule de résultat : (Actif Final + Crédits) - (Actif Initial + Dépenses)
        // Note: C'est une formule comptable simplifiée pour le résultat d'exploitation
        $result = ($finalAssets + $totalCredits) - ($initialAssets + $totalDepenses);

        return $result;
    }


    public function show(Trimestre $trimestre)
    {
        // Charger toutes les relations pour l'affichage détaillé
        $trimestre->load('stocks.produit', 'boutique', 'depenses', 'credits'); 
        
        return Inertia::render('Trimestres/TrimestreDetails', [
            'trimestre' => $trimestre,
        ]);
    }
}