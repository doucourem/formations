<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Trip;
use App\Models\Transfer;
use App\Models\Sender;
use App\Models\Receiver;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TransferController extends Controller
{
    public function index(Request $request)
{
    $query = Transfer::with(['sender', 'receiver']);

    // Filtres
    if ($request->sender) {
        $query->whereHas('sender', fn($q) => $q->where('name', 'like', "%{$request->sender}%"));
    }
    if ($request->receiver) {
        $query->whereHas('receiver', fn($q) => $q->where('name', 'like', "%{$request->receiver}%"));
    }
    if ($request->code) {
        $query->where('withdraw_code', $request->code);
    }
    if ($request->status) {
        $query->where('status', $request->status);
    }

    $perPage = $request->per_page ?? 10;

    $transfers = $query->orderBy('created_at', 'desc')->paginate($perPage)->appends($request->all());

    // Transformer pour React
    $transfers->getCollection()->transform(function($t) {
        return [
            'id' => $t->id,
            'sender_name' => $t->sender->name,
            'receiver_name' => $t->receiver->name,
            'amount' => $t->amount,
            'code' => $t->withdraw_code,
            'status' => $t->status,
            'paid' => $t->paid,
            'payment_proof' => $t->payment_proof,
            'created_at' => $t->created_at->format('d/m/Y H:i'),
        ];
    });

    return inertia('Transfers/Index', [
        'transfers' => $transfers,
        'filters' => $request->all(),
    ]);
}


    public function create()
{
    // Fetch senders and receivers from DB
    $senders = Sender::all();
    $receivers = Receiver::all();

    return Inertia::render('Transfers/Create', [
        'senders' => $senders,
        'receivers' => $receivers
    ]);
}

    public function store(Request $request)
    {
        $data = $request->validate([
            'sender_id' => 'required|exists:senders,id',
            'receiver_id' => 'required|exists:receivers,id',
            'amount' => 'required|numeric|min:1',
            'fees' => 'nullable|numeric|min:0',
        ]);

        // Générer un code de retrait unique
        $code = rand(100000, 999999);

        // Créer le transfert
        Transfer::create([
            'sender_id' => $data['sender_id'],
            'receiver_id' => $data['receiver_id'],
            'amount' => $data['amount'],
            'fees' => $data['fees'] ?? ($data['amount'] * 0.02), // par défaut 2%
            'withdraw_code' => $code,
        ]);

        return redirect()->route('transfers.index')->with('success', 'Transfert créé avec succès.');
    }

public function edit(Transfer $transfer)
{
    return inertia('Transfers/Edit', [
        'transfer' => $transfer->load('sender','receiver'),
        'senders' => Sender::all(),
        'receivers' => Receiver::all(),
    ]);
}

   public function update(Request $request, Transfer $transfer)
{
    $data = $request->validate([
        'sender_id' => 'required|exists:senders,id',
        'receiver_id' => 'required|exists:receivers,id',
        'amount' => 'required|numeric|min:1',
        'fees' => 'nullable|numeric|min:0',
        'status' => 'nullable|string',
    ]);

    // Met à jour le transfert
    $transfer->update([
        'sender_id' => $data['sender_id'],
        'receiver_id' => $data['receiver_id'],
        'amount' => $data['amount'],
        'fees' => $data['fees'] ?? ($data['amount'] * 0.02), // calcul par défaut si non fourni
        'status' => $data['status'] ?? $transfer->status,
    ]);

    return redirect()->route('transfers.index')->with('success', 'Transfert mis à jour avec succès.');
}


    public function destroy(Transfer $transfer)
    {
        $transfer->delete();
        return back();
    }
}
