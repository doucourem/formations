<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\ThirdParty;
use App\Models\Transaction;
use App\Models\Payment;


class HistoryController extends Controller
{
    public function index(Request $request)
{
    $startDate = $request->input('startDate', now()->startOfDay()->toDateString());
    $endDate = $request->input('endDate', now()->toDateString());
    $clientId = $request->input('clientId');

    // Récupérer les clients
    $clients = ThirdParty::all();

    // Transactions filtrées par client et date
    $transactions = Transaction::with('transfer.thirdParty')
        ->when($clientId, fn($q) => $q->whereHas('transfer', fn($q2) => $q2->where('third_party_id', $clientId)))
        ->whereDate('created_at', '>=', $startDate)
        ->whereDate('created_at', '<=', $endDate)
        ->get();

    // Paiements filtrés par client et date (si tu as un type ou un statut "payment")
    $payments = $transactions->where('type', 'payment'); // ou autre critère pour distinguer

    $transactionsOnly = $transactions->where('type', 'transfer'); // ou autre critère

    return Inertia::render('History/index', [
        'clients' => $clients,
        'transactions' => $transactionsOnly,
        'payments' => $payments,
        'startDate' => $startDate,
        'endDate' => $endDate,
        'selectedClient' => $clientId ? ThirdParty::find($clientId) : null
    ]);
}

}
