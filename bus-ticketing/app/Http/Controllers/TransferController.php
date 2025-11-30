<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TransferController extends Controller
{
    public function index()
    {
        $transfers = Transfer::with(['sender','receiver'])
            ->latest()
            ->paginate(request('per_page', 10));

        return inertia('Transfers/Index', [
            'transfers' => $transfers,
            'filters' => request()->all()
        ]);
    }

    public function create()
    {
        return inertia('Transfers/Create');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'sender_name' => 'required',
            'sender_phone' => 'required',
            'receiver_name' => 'required',
            'receiver_phone' => 'required',
            'amount' => 'required|numeric|min:1',
        ]);

        // 1) Créer expéditeur
        $sender = Sender::create([
            'name' => $data['sender_name'],
            'phone' => $data['sender_phone'],
        ]);

        // 2) Créer destinataire
        $receiver = Receiver::create([
            'name' => $data['receiver_name'],
            'phone' => $data['receiver_phone'],
        ]);

        // 3) Générer code retrait
        $code = rand(100000, 999999);

        // 4) Créer transfert
        Transfer::create([
            'sender_id' => $sender->id,
            'receiver_id' => $receiver->id,
            'amount' => $data['amount'],
            'fees' => $data['amount'] * 0.02, // exemple 2%
            'withdraw_code' => $code,
        ]);

        return redirect()->route('transfers.index');
    }

    public function edit(Transfer $transfer)
    {
        return inertia('Transfers/Edit', [
            'transfer' => $transfer->load('sender','receiver'),
        ]);
    }

    public function update(Request $request, Transfer $transfer)
    {
        $data = $request->validate([
            'amount' => 'required|numeric|min:1',
            'status' => 'required',
        ]);

        // Mise à jour
        $transfer->update($data);

        return redirect()->route('transfers.index');
    }

    public function destroy(Transfer $transfer)
    {
        $transfer->delete();
        return back();
    }
}
