<?php

namespace App\Http\Controllers;

use App\Models\Trip;
use App\Models\TripExpense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TripExpenseController extends Controller
{
    /**
     * Afficher toutes les dépenses d'un trajet
     */
    public function index(Trip $trip)
    {
        $trip->load('expenses'); // récupère toutes les dépenses liées au trajet

        return Inertia::render('Trips/Expenses', [
            'trip' => $trip,
            'expenses' => $trip->expenses->map(function ($exp) {
                return [
                    'id' => $exp->id,
                    'type' => $exp->type,
                    'amount' => $exp->amount,
                    'description' => $exp->description,
                ];
            }),
        ]);
    }

    /**
     * Stocker une nouvelle dépense
     */
   public function store(Request $request, Trip $trip)
{
    $data = $request->validate([
        'type' => 'required|string',
        'amount' => 'required|numeric|min:0',
        'description' => 'nullable|string',
    ]);

    $trip->expenses()->create($data);

    return redirect()->back()->with('message', 'Dépense ajoutée avec succès');
}


    /**
     * Supprimer une dépense
     */
    public function destroy(TripExpense $tripExpense)
    {
        $tripExpense->delete();

        return redirect()->back()->with('message', 'Dépense supprimée avec succès');
    }

    /**
     * Modifier une dépense (optionnel)
     */
    public function update(Request $request, TripExpense $tripExpense)
    {
        $data = $request->validate([
            'type' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'description' => 'nullable|string',
        ]);

        $tripExpense->update($data);

        return redirect()->back()->with('message', 'Dépense mise à jour avec succès');
    }
}
