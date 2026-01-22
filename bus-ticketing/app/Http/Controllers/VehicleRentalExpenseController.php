<?php

namespace App\Http\Controllers;

use App\Models\VehicleRental;
use App\Models\VehicleRentalExpense;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleRentalExpenseController extends Controller
{
    public function store(Request $request)
{
    $validated = $request->validate([
        'vehicle_rental_id' => 'required|exists:vehicle_rentals,id',
        'type' => 'required|in:chauffeur,carburant,peages,restauration,entretien,autres',
        'amount' => 'required|numeric|min:0',
        'description' => 'nullable|string|max:500',
    ]);

    VehicleRentalExpense::create($validated);

    return back()->with('success', 'Dépense ajoutée avec succès.');
}

public function update(Request $request, VehicleRentalExpense $expense)
{
    $validated = $request->validate([
        'type' => 'required|in:chauffeur,carburant,peages,restauration,entretien,autres',
        'amount' => 'required|numeric|min:0',
        'description' => 'nullable|string|max:500',
    ]);

    $expense->update($validated);

    return back()->with('success', 'Dépense mise à jour avec succès.');
}


    /**
     * Supprimer une dépense.
     */
    public function destroy(VehicleRentalExpense $expense)
    {
        $expense->delete();

        return back()->with('success', 'Dépense supprimée avec succès.');
    }

    /**
     * (Optionnel) Lister toutes les dépenses d'une location
     */
    public function index(VehicleRental $vehicleRental)
    {
        $expenses = $vehicleRental->expenses()->latest()->get();

        return Inertia::render('VehicleRentalExpenses/Index', [
            'vehicleRental' => $vehicleRental,
            'expenses' => $expenses,
        ]);
    }
}
