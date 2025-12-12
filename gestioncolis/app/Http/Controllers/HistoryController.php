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

        $clients = ThirdParty::all();
        $transactions = Transaction::with('client')
            ->when($clientId, fn($q) => $q->where('client_id', $clientId))
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->get();

        $payments = Transaction::with('client')
            ->when($clientId, fn($q) => $q->where('client_id', $clientId))
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->get();

        return Inertia::render('History', [
            'clients' => $clients,
            'transactions' => $transactions,
            'payments' => $payments,
            'startDate' => $startDate,
            'endDate' => $endDate,
            'selectedClient' => $clientId ? Client::find($clientId) : null
        ]);
    }
}
