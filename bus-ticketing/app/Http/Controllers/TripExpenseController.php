<?php

namespace App\Http\Controllers;

use App\Models\TripExpense;
use App\Models\Trip;
use Illuminate\Http\Request;

class TripExpenseController extends Controller
{
    /**
     * Enregistrer une nouvelle dépense pour un trajet
     */
    public function store(Request $request)
    {
        // Validation des données
        $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'type' => 'required|string|in:toll,meal,maintenance,other',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        // Vérification que le trajet existe
        $trip = Trip::findOrFail($request->trip_id);

        // Création de la dépense
        $tripExpense = TripExpense::create([
            'trip_id' => $trip->id,
            'type' => $request->type,
            'amount' => $request->amount,
            'description' => $request->description,
        ]);

        // Retour à la page précédente avec message de succès
        return redirect()->back()->with('success', 'Dépense ajoutée avec succès.');
    }
}
