<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\DeliveryExpense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DeliveryExpenseController extends Controller
{
    public function index(Delivery $delivery)
    {
        $expenses = $delivery->expenses()->paginate(10);

        return Inertia::render('DeliveryExpenses/Index', [
            'delivery' => $delivery,
            'expenses' => $expenses,
        ]);
    }

    public function create(Delivery $delivery)
    {
        return Inertia::render('DeliveryExpenses/Create', [
            'delivery' => $delivery,
            'types' => DeliveryExpense::typeLabels(),
        ]);
    }

   

    public function edit(Delivery $delivery, DeliveryExpense $expense)
    {
        return Inertia::render('DeliveryExpenses/Edit', [
            'delivery' => $delivery,
            'expense' => $expense,
            'types' => DeliveryExpense::typeLabels(),
        ]);
    }

    public function store(Request $request, Delivery $delivery)
{
    $data = $request->validate([
        'type' => 'required|in:chauffeur,carburant,peages,restauration,entretien,autres',
        'amount' => 'required|numeric|min:0',
        'description' => 'nullable|string',
    ]);

    $delivery->expenses()->create($data);

   return back()->with('success', 'Dépense ajoutée avec succès.');
}

public function update(Request $request, Delivery $delivery, DeliveryExpense $expense)
{
    $data = $request->validate([
        'type' => 'required|in:chauffeur,carburant,peages,restauration,entretien,autres',
        'amount' => 'required|numeric|min:0',
        'description' => 'nullable|string',
    ]);

    $expense->update($data);

    return back()->with('success', 'Dépense mise à jour avec succès.');
}


public function totalByTypeGlobal()
{
    return DB::table('delivery_expenses')
        ->select('type', DB::raw('SUM(amount) as total'))
        ->groupBy('type')
        ->orderBy('type')
        ->get();
}


    public function destroy(Delivery $delivery, DeliveryExpense $expense)
    {
        $expense->delete();

        return redirect()->route('delivery-expenses.index', $delivery->id)
                         ->with('success', 'Dépense supprimée.');
    }
}
