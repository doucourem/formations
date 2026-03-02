<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\DeliveryPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class DeliveryPaymentController extends Controller
{
    /**
     * Enregistrer un paiement
     */
    public function store(Request $request, Delivery $delivery)
    {
        $data = $request->validate([
            'amount' => ['required','numeric','min:1'],
            'method' => ['nullable','string','max:50'],
            'note'   => ['nullable','string','max:255'],
        ]);

        $data['delivery_id'] = $delivery->id;
        $data['user_id'] = Auth::id();

        DeliveryPayment::create($data);

        return back()->with('success','Paiement enregistré.');
    }

    /**
     * Supprimer un paiement
     */
    public function destroy(DeliveryPayment $payment)
    {
        $payment->delete();

        return back()->with('success','Paiement supprimé.');
    }

    /**
     * Reçu PDF individuel
     */
    public function receipt(DeliveryPayment $payment)
    {
        $payment->load([
            'delivery.bus',
            'delivery.driver',
            'user'
        ]);

        $pdf = Pdf::loadView('pdf.payment_receipt', [
            'payment' => $payment
        ]);

        return $pdf->download("Recu_Paiement_{$payment->id}.pdf");
    }

    


}