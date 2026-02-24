<?php

namespace App\Http\Controllers;

use App\Models\VehicleRental;
use App\Models\VehicleRentalPayment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Barryvdh\DomPDF\Facade\Pdf;

class VehicleRentalPaymentController extends Controller
{
    /**
     * Enregistrer un paiement location
     */
    public function store(Request $request, VehicleRental $vehicleRental)
    {
        $data = $request->validate([
            'amount' => ['required','numeric','min:1'],
            'method' => ['nullable','string','max:50'],
            'note'   => ['nullable','string','max:255'],
        ]);

        $data['vehicle_rental_id'] = $vehicleRental->id;
        $data['user_id'] = Auth::id();

        VehicleRentalPayment::create($data);

        return back()->with('success','Paiement location enregistré.');
    }

    /**
     * Supprimer paiement location
     */
    public function destroy(VehicleRentalPayment $payment)
    {
        $payment->delete();

        return back()->with('success','Paiement supprimé.');
    }

    /**
     * Reçu PDF paiement location
     */
    public function receipt(VehicleRentalPayment $payment)
    {
        $payment->load([
            'rental.bus',
            'rental.driver',
            'user'
        ]);

        $pdf = Pdf::loadView('pdf.rental_payment_receipt', [
            'payment' => $payment
        ]);

        return $pdf->download("Recu_Location_{$payment->id}.pdf");
    }
}