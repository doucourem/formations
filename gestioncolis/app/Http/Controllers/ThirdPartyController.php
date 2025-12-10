<?php

namespace App\Http\Controllers;

use App\Models\ThirdParty;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ThirdPartyController extends Controller
{
    // Liste des tiers liés à l'utilisateur connecté
    public function index()
{
    $thirdParties = ThirdParty::with(['transfersAsThirdParty' => function($q){
        $q->select('third_party_id', 'amount', 'paid');
    }])->get();

    // Transformer les données pour le frontend
    $thirdParties = $thirdParties->map(function($tp){
        $totalAmount = $tp->transfersAsThirdParty->sum('amount');
        $totalPaid = $tp->transfersAsThirdParty
                ->where('paid', 1)
                ->sum('amount'); // 'amount' = montant du transfert


        return [
            'id' => $tp->id,
            'name' => $tp->name,
            'phone' => $tp->phone,
            'total_amount' => $totalAmount,
            'total_paid' => $totalPaid,
        ];
    });

    return inertia('ThirdParties/Index', [
        'thirdParties' => $thirdParties
    ]);
}


    // Formulaire de création
    public function create()
    {
        return Inertia::render('ThirdParties/Create');
    }

    // Stocker un nouveau tiers
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
        ]);

        $thirdParty = ThirdParty::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'user_id' => auth()->id(), // assigne l'utilisateur connecté
        ]);

        return back()->with([
            'success' => 'Tiers créé avec succès',
            'thirdParty' => $thirdParty
        ]);
    }

    // Formulaire de modification
    public function edit(ThirdParty $thirdParty)
    {
        $this->authorizeUser($thirdParty);

        return Inertia::render('ThirdParties/Edit', [
            'thirdParty' => $thirdParty
        ]);
    }

    // Mettre à jour
    public function update(Request $request, ThirdParty $thirdParty)
    {
        $this->authorizeUser($thirdParty);

        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:50',
        ]);

        $thirdParty->update($request->only('name', 'phone'));

        return back()->with('success', 'Tiers mis à jour avec succès');
    }

    // Supprimer
    public function destroy(ThirdParty $thirdParty)
    {
        $this->authorizeUser($thirdParty);

        $thirdParty->delete();

        return back()->with('success', 'Tiers supprimé avec succès');
    }


    public function show(ThirdParty $thirdParty)
{
    $thirdParty->load(['transfers.sender', 'transfers.receiver']); // charger relations
    $transfers = $thirdParty->transfers->map(fn($t) => [
        'id' => $t->id,
        'sender_name' => $t->sender->name,
        'receiver_name' => $t->receiver->name,
        'amount' => $t->amount,
        'paid' => $t->paid,
        'withdraw_code' => $t->withdraw_code,
        'status' => $t->status,
    ]);

    return inertia('ThirdParties/Show', [
        'thirdParty' => [
            'id' => $thirdParty->id,
            'name' => $thirdParty->name,
            'phone' => $thirdParty->phone,
            'transfers' => $transfers,
        ],
    ]);
}

    // Vérifie que l'utilisateur est propriétaire
    private function authorizeUser(ThirdParty $thirdParty)
    {
        if ($thirdParty->user_id !== auth()->id()) {
            abort(403, "Action non autorisée");
        }
    }
}
