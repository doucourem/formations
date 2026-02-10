<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Transfer;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class PaymentController extends Controller
{
    /**
     * Process payment for a transfer
     */
    public function process(Request $request)
    {
        // Validation
        $validator = Validator::make($request->all(), [
            'transfer_id' => 'required|exists:transfers,id',
            'amount'      => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => $validator->errors()->first()
            ], 422);
        }

        $transfer = Transfer::find($request->transfer_id);

        // Vérifier si déjà payé
        if ($transfer->paid) {
            return response()->json([
                'success' => false,
                'message' => 'Le transfert est déjà payé.'
            ]);
        }

       try {
    Transaction::create([
        'transfer_id' => $transfer->id,
        'amount'      => $request->amount,
        'method'      => 'cash',
        'status'      => 'success',
        'user_id'     => auth()->id(),
        'paid_at'     => now(),
    ]);

    // ⚡ Mettre à jour le transfert pour qu'il soit marqué comme payé
    $transfer->update(['paid' => true]);

    return response()->json([
        'success' => true,
        'message' => 'Paiement effectué avec succès.'
    ]);
} catch (\Exception $e) {
    return response()->json([
        'success' => false,
        'message' => 'Erreur lors du paiement : ' . $e->getMessage()
    ], 500);
}

    }
}
