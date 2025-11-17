<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Twilio\TwiML\MessagingResponse;
use App\Http\Controllers\TicketController;
use App\Models\Trip;
use Carbon\Carbon;
// Webhook recherche billets
Route::post('/webhook/tickets/search', [TicketController::class, 'webhookSearch']);

// Webhook WhatsApp principal


Route::post('/twilio/webhook', function(Request $request) {

    $from = $request->input('From');
    $body = trim($request->input('Body', ''));

    Log::info('Webhook Twilio reçu', [
        'from' => $from,
        'body' => $body
    ]);

    $twiml = new MessagingResponse();

    // Vérifier si l'utilisateur envoie un ID de voyage (numérique)
    if (ctype_digit($body)) {
        $tripId = intval($body);
        $trip = Trip::with('route.departureCity', 'route.arrivalCity', 'bus')->find($tripId);

        if (!$trip) {
            $reply = "Voyage introuvable. Veuillez vérifier l'ID.";
        } else {
            // Marquer le voyage comme réservé par ce numéro WhatsApp
           /* $trip->update([
                'reserved_by_whatsapp' => $from,
                'status' => 'reserved'
            ]);
*/
            $departureCity = $trip->route->departureCity->name ?? 'N/A';
            $arrivalCity   = $trip->route->arrivalCity->name ?? 'N/A';
            $busName       = $trip->bus->name ?? 'N/A';
            $departureTime = optional($trip->departure_at)->format('H:i') ?? 'N/A';
            $arrivalTime   = optional($trip->arrival_at)->format('H:i') ?? 'N/A';

            $reply = "✅ Voyage ID {$trip->id} réservé avec succès !\n";
            $reply .= "{$departureCity} -> {$arrivalCity}\n";
            $reply .= "Départ: {$departureTime} - Arrivée: {$arrivalTime}\n";
            $reply .= "Bus: {$busName}\n";
            $reply .= "Merci pour votre réservation.";
        }

        $twiml->message($reply);
        Log::info('Réponse Twilio envoyée (sélection voyage)', ['reply' => $reply]);
        return response($twiml, 200)->header('Content-Type', 'application/xml');
    }

    // Sinon, on suppose que l'utilisateur envoie une recherche de voyage
    preg_match('/(.+)->(.+)\s+(\d{4}-\d{2}-\d{2})/', $body, $matches);

    if (!$matches) {
        $reply = "Format invalide.\nExemple : Bamako -> Kayes 2025-11-15";
    } else {
        [$all, $departure, $arrival, $date] = $matches;
        $dateCarbon = Carbon::parse($date);

        $trips = Trip::with('route.departureCity', 'route.arrivalCity', 'bus')
            ->whereDate('departure_at', $dateCarbon)
            ->whereHas('route.departureCity', fn($q) => $q->where('name', 'like', "%$departure%"))
            ->whereHas('route.arrivalCity', fn($q) => $q->where('name', 'like', "%$arrival%"))
            ->orderBy('departure_at')
            ->get();

        if ($trips->isEmpty()) {
            $reply = "Aucun voyage trouvé pour $departure -> $arrival le $date";
        } else {
            $reply = "Voyages disponibles :\n";
            foreach ($trips as $trip) {
                $departureCity = $trip->route->departureCity->name ?? 'N/A';
                $arrivalCity   = $trip->route->arrivalCity->name ?? 'N/A';
                $busName       = $trip->bus->name ?? 'N/A';
                $departureTime = optional($trip->departure_at)->format('H:i') ?? 'N/A';
                $arrivalTime   = optional($trip->arrival_at)->format('H:i') ?? 'N/A';
                $price         = $trip->route->price ?? 'à définir';

                $reply .= "ID {$trip->id} - {$departureCity} -> {$arrivalCity} - Départ: {$departureTime} - Arrivée: {$arrivalTime} - Bus: {$busName} - Prix: {$price} FCFA\n";
            }
            $reply .= "\nPour réserver un voyage, envoyez simplement l'ID du voyage.";
        }
    }

    $twiml->message($reply);
    Log::info('Réponse Twilio envoyée (recherche voyage)', ['reply' => $reply]);

    return response($twiml, 200)->header('Content-Type', 'application/xml');
});



// Sélection d'un billet
Route::post('/twilio/select-ticket', function(Request $request) {

    $from = $request->input('From');
    $ticketId = trim($request->input('Body', ''));

    $ticket = \App\Models\Ticket::with('trip.route', 'startStop', 'endStop')->find($ticketId);

    if (!$ticket) {
        $reply = "Billet introuvable.";
    } elseif ($ticket->status !== 'reserved') {
        $reply = "Ce billet n'est pas disponible.";
    } else {
        $ticket->update([
            'status' => 'paid',
            'client_name' => $from,
        ]);

        $reply = "Billet ID {$ticket->id} réservé avec succès !\n";
        $reply .= "Siège : {$ticket->seat_number}\n";
        $reply .= "Prix : {$ticket->price} FCFA";
    }

    $twiml = new MessagingResponse();
    $twiml->message($reply);

    return response($twiml, 200)->header('Content-Type', 'application/xml');
});
