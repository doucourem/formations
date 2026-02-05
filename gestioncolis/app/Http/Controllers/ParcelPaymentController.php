<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use App\Models\ParcelPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ParcelPaymentController extends Controller
{
    /**
     * 📄 Formulaire + historique
     */
    public function edit(Parcel $parcel)
    {
        return Inertia::render('Parcels/Payment', [
            'parcel' => [
                'id'               => $parcel->id,
                'tracking_number'  => $parcel->tracking_number,
                'price'           => $parcel->price,
                'paid_amount'      => $parcel->paid_amount,
                'remaining_amount' => $parcel->remaining_amount,
                'payment_type'     => $parcel->payment_type,
            ],
            'payments' => $parcel->payments()
                ->with('user:id,name')
                ->latest()
                ->get(),
        ]);
    }

    /**
     * 💰 Paiement + trace
     */
    public function store(Request $request, Parcel $parcel)
    {
        $validated = $request->validate([
            'paid_amount'     => ['required', 'numeric', 'min:1'],
            'payment_method'  => ['nullable', 'string'],
        ]);

        if ($parcel->remaining_amount <= 0) {
            return back()->with('error', 'Ce colis est déjà soldé.');
        }

        if ($validated['paid_amount'] > $parcel->remaining_amount) {
            return back()->withErrors([
                'paid_amount' => 'Montant supérieur au reste à payer.',
            ]);
        }

        DB::transaction(function () use ($parcel, $validated) {

            // 🔍 TRACE DE PAIEMENT
            ParcelPayment::create([
                'parcel_id'      => $parcel->id,
                'amount'         => $validated['paid_amount'],
                'payment_method' => $validated['payment_method'] ?? 'cash',
                'user_id'        => Auth::id(),
            ]);

            // 🔄 MAJ COLIS
            $parcel->paid_amount += $validated['paid_amount'];
            $parcel->remaining_amount -= $validated['paid_amount'];

            $parcel->payment_type = $parcel->remaining_amount == 0
                ? 'full'
                : 'partial';

            $parcel->save();
        });

        return redirect()
            ->route('parcels.editPayment', $parcel)
            ->with('success', 'Paiement enregistré avec succès.');
    }
}
