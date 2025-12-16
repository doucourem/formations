<?php

namespace App\Http\Controllers;

 use Inertia\Inertia;
use Illuminate\Http\Request;
use App\Models\ThirdParty;
use App\Models\Transaction;
use App\Models\Payment;

class ReportController extends Controller
{
   

public function index(Request $request)
{
    $start = $request->start;
    $end = $request->end;

    $clients = ThirdParty::with(['transfers.transactions'])
    ->when($start && $end, fn($q) => $q->whereBetween('created_at', [$start, $end]))
    ->get()
    ->map(function ($c) {
        // Récupérer toutes les transactions liées aux transferts
        $transactions = $c->transfers->flatMap(fn($t) => $t->transactions);

        return [
            'id' => $c->id,
            'name' => $c->name,
            'total_sent' => $transactions->sum('amount_sent'),
            'total_to_pay' => $transactions->sum('amount_to_pay'),
            'total_paid' => $transactions->sum('amount_paid'), // si tu as un champ amount_paid
            'current_debt' => $transactions->sum('amount_to_pay') - $transactions->sum('amount_paid'),
        ];
    });


    return Inertia::render('reports/ReportsPage', [
        'reports' => [
            'clients' => $clients,
            'transactions' => [],
            'payments' => [],
        ],
    ]);
}

}
