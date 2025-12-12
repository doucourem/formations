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

    $clients = ThirdParty::with(['transactions', 'payments'])
        ->when($start && $end, fn($q) => $q->whereBetween('created_at', [$start, $end]))
        ->get()
        ->map(fn($c) => [
            'id' => $c->id,
            'name' => $c->name,
            'total_sent' => $c->transactions->sum('amount_sent'),
            'total_to_pay' => $c->transactions->sum('amount_to_pay'),
            'total_paid' => $c->payments->sum('amount'),
            'current_debt' => $c->transactions->sum('amount_to_pay') - $c->payments->sum('amount'),
        ]);

    return Inertia::render('reports/ReportsPage', [
        'reports' => [
            'clients' => $clients,
            'transactions' => [],
            'payments' => [],
        ],
    ]);
}

}
