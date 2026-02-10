<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Services\TwilioReservationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentWebhookController extends Controller
{
    public function handle(Request $request)
    {
        Log::info("PAYMENT CALLBACK REÇU", $request->all());

        // Exemple JSON reçu :
        // {
        //   "tx_id": "123456",
        //   "amount": 5000,
        //   "status": "SUCCESS",
        //   "reference": "TICKET-42",   ← très important
        //   "operator": "orange_money"
        // }

        $reference = $request->input('reference');
        $status    = $request->input('status');
        $txId      = $request->input('tx_id');

        if (!$reference) {
            return response()->json(['error' => 'missing_reference'], 422);
        }

        // Référence au format TICKET-42
        if (!preg_match('/TICKET-(\d+)/', $reference, $match)) {
            Log::warning("REFERENCE INVALID", compact('reference'));
            return response()->json(['error' => 'invalid_reference'], 400);
        }

        $ticketId = $match[1];

        $ticket = Ticket::with('trip.route.departureCity', 'trip.route.arrivalCity')
                        ->find($ticketId);

        if (!$ticket) {
            Log::warning("TICKET NOT FOUND", compact('ticketId'));
            return response()->json(['error' => 'ticket_not_found'], 404);
        }

        // Si paiement OK
        if ($status === 'SUCCESS') {
            $ticket->paid = true;
            $ticket->payment_reference = $txId;
            $ticket->save();

            Log::info("TICKET PAYÉ", ['ticket_id' => $ticket->id]);

            // Envoi automatique du PDF + QR
            app(TwilioReservationService::class)
                ->sendTicketAfterPayment($ticket);

            return response()->json(['message' => 'payment_success']);
        }

        // Si paiement échoué
        if ($status === 'FAILED') {
            Log::warning("PAIEMENT ÉCHOUÉ", compact('ticketId'));
            $ticket->paid = false;
            $ticket->save();

            return response()->json(['message' => 'payment_failed']);
        }

        return response()->json(['message' => 'status_ignored']);
    }
}
