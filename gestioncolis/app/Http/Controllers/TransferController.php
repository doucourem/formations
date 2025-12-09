<?php

namespace App\Http\Controllers;

use App\Models\Transfer;
use App\Models\Sender;
use App\Models\Receiver;
use App\Models\ThirdParty;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;

class TransferController extends Controller
{
    public function index(Request $request)
    {
        $query = Transfer::with(['sender','receiver','thirdParty'])
        ->where('user_id', Auth::id());


        // Filtres
        if ($request->sender) {
            $query->whereHas('sender', fn($q) => $q->where('name', 'like', "%{$request->sender}%"));
        }
        if ($request->receiver) {
            $query->whereHas('receiver', fn($q) => $q->where('name', 'like', "%{$request->receiver}%"));
        }
        if ($request->third_party) {
            $query->whereHas('thirdParty', fn($q) => $q->where('name', 'like', "%{$request->third_party}%"));
        }
        if ($request->code) {
            $query->where('withdraw_code', $request->code);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }

        $perPage = $request->per_page ?? 10;
        $transfers = $query->orderBy('created_at', 'desc')->paginate($perPage)->appends($request->all());
        $transfers->getCollection()->transform(function($t) {
            return [
                'id' => $t->id,
                'sender_name' => $t->sender->name,
                'receiver_name' => $t->receiver->name,
                'third_party_name' => $t->thirdParty->name ?? null,
                'amount' => $t->amount,
                'code' => $t->withdraw_code,
                'status' => $t->status,
                'paid' => $t->paid,
                'payment_proof' => $t->payment_proof,
                'created_at' => $t->created_at->format('d/m/Y H:i'),
            ];
        });

        return Inertia::render('Transfers/Index', [
            'transfers' => $transfers,
            'filters' => $request->all(),
        ]);
    }

    public function create()
    {
        $senders = Sender::where('user_id', Auth::id())->get();
        $receivers = Receiver::where('user_id', Auth::id())->get();
        $thirdParties = ThirdParty::where('user_id', Auth::id())->get();

        return Inertia::render('Transfers/Create', [
            'senders' => $senders,
            'receivers' => $receivers,
            'thirdParties' => $thirdParties,
        ]);
    }



public function store(Request $request)
{
    try {
        // Validation
        $data = $request->validate([
            'sender_id' => 'required|exists:senders,id',
            'receiver_id' => 'required|exists:receivers,id',
            'third_party_id' => 'required|exists:third_parties,id',
            'amount' => 'required|numeric|min:1',
            'fees' => 'nullable|numeric|min:0',
        ]);

        // Générer un code de retrait unique
        $code = rand(100000, 999999);

        // Créer le transfert
        Transfer::create([
            'sender_id' => $data['sender_id'],
            'receiver_id' => $data['receiver_id'],
            'third_party_id' => $data['third_party_id'],
            'amount' => $data['amount'],
            'fees' => $data['fees'] ?? ($data['amount'] * 0.02),
            'withdraw_code' => $code,
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('transfers.index')->with('success', 'Transfert créé avec succès.');

    } catch (\Illuminate\Validation\ValidationException $e) {
        // Erreurs de validation
        return redirect()->back()->withErrors($e->errors())->withInput();
    } catch (\Exception $e) {
        // Erreurs générales
        Log::error('Erreur création transfert : ' . $e->getMessage());
        return redirect()->back()->with('error', 'Une erreur est survenue lors de la création du transfert.')->withInput();
    }
}


    public function edit(Transfer $transfer)
    {
        return Inertia::render('Transfers/Edit', [
            'transfer' => $transfer->load('sender','receiver','thirdParty'),
            'senders' => Sender::where('user_id', Auth::id())->get(),
            'receivers' => Receiver::where('user_id', Auth::id())->get(),
            'thirdParties' => ThirdParty::where('user_id', Auth::id())->get(),
        ]);
    }

    public function update(Request $request, Transfer $transfer)
    {
        $data = $request->validate([
            'sender_id' => 'required|exists:senders,id',
            'receiver_id' => 'required|exists:receivers,id',
            'third_party_id' => 'required|exists:third_parties,id',
            'amount' => 'required|numeric|min:1',
            'fees' => 'nullable|numeric|min:0',
            'status' => 'nullable|string',
        ]);

        $transfer->update([
            'sender_id' => $data['sender_id'],
            'receiver_id' => $data['receiver_id'],
            'third_party_id' => $data['third_party_id'],
            'amount' => $data['amount'],
            'fees' => $data['fees'] ?? ($data['amount'] * 0.02),
            'status' => $data['status'] ?? $transfer->status,
            'user_id' => Auth::id(),
        ]);

        return redirect()->route('transfers.index')->with('success', 'Transfert mis à jour avec succès.');
    }

    public function show(Transfer $transfer)
{
    $transfer->loadMissing(['sender', 'receiver']);

    return Inertia::render('Transfers/Show', [
        'transfer' => $transfer,
    ]);
}

public function daily(Request $request)
{
    $query = Transfer::query();

    // Filtrer par jour précis
    if ($request->has('date') && $request->date) {
        $query->whereDate('created_at', $request->date);
    }

    // Filtrer par période
    if ($request->has('start_date') && $request->start_date && $request->has('end_date') && $request->end_date) {
        $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
    }

    $dailyTransfers = $query
        ->selectRaw('DATE(created_at) as day, COUNT(*) as total_transfers, SUM(amount) as total_amount')
        ->groupBy('day')
        ->orderBy('day', 'desc')
        ->get();

    return response()->json($dailyTransfers);
}
    public function destroy(Transfer $transfer)
    {
        $transfer->delete();
        return back();
    }
}
