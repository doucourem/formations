<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Twilio\TwiML\MessagingResponse;
use App\Http\Controllers\TicketController;
use App\Models\Trip;
use Carbon\Carbon;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Cache;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;
use Twilio\Rest\Client;
use App\Models\Ticket;

use App\Http\Controllers\PaymentWebhookController;

Route::post('/payments/callback', [PaymentWebhookController::class, 'handle'])
     ->name('payments.callback');

// Webhook recherche billets
Route::post('/webhook/tickets/search', [TicketController::class, 'webhookSearch']);

// Webhook WhatsApp principal

Route::post('/twilio/webhook', function(Request $request) {
    $from = $request->input('From');
    $body = trim($request->input('Body', ''));
    $bodyLower = Str::lower($body);
    $twiml = new MessagingResponse();

    Log::info('Webhook Twilio reçu', ['from' => $from, 'body' => $body]);

    // Clés cache
    $cacheTrip = "whatsapp_trip_{$from}";
    $cacheName = "whatsapp_name_{$from}";
    $cachePayment = "whatsapp_payment_{$from}";

    $tripId = Cache::get($cacheTrip);
    $clientName = Cache::get($cacheName);
    $paymentMethod = Cache::get($cachePayment);

    // Map des paiements
    $paymentMap = [
        '1' => 'Orange Money', '1️⃣' => 'Orange Money',
        '2' => 'Wave', '2️⃣' => 'Wave',
        '3' => 'Cash', '3️⃣' => 'Cash'
    ];

    // ----------------------
    // Étape 1 : Nom du client
    // ----------------------
    if ($tripId && !$clientName) {
        Cache::put($cacheName, $body, now()->addMinutes(30));
        $twiml->message("Merci {$body} ! Maintenant, choisissez le mode de paiement :\n1️⃣ Orange Money\n2️⃣ Wave\n3️⃣ Cash");
        return response($twiml, 200)->header('Content-Type', 'application/xml');
    }

    // ----------------------
    // Étape 2 : Choix du paiement
    // ----------------------
    if ($tripId && !$paymentMethod && isset($paymentMap[$bodyLower])) {
        $method = $paymentMap[$bodyLower];
        Cache::put($cachePayment, $method, now()->addMinutes(30));

        $paymentMessages = [
            'Orange Money' => "💳 Vous avez choisi Orange Money. Envoyez le paiement au numéro 70XXXXXX et confirmez avec le code de transaction.",
            'Wave' => "💳 Vous avez choisi Wave. Envoyez le paiement au numéro 66XXXXXX et confirmez avec le code de transaction.",
            'Cash' => "💵 Vous avez choisi Cash. Rendez-vous à la gare pour payer votre billet."
        ];

        $twiml->message($paymentMessages[$method]);
        return response($twiml, 200)->header('Content-Type', 'application/xml');
    }

    // ----------------------
    // Étape 3 : Confirmation du paiement
    // ----------------------
    if ($tripId && $clientName && $paymentMethod) {
        $trip = Trip::with('route.departureCity', 'route.arrivalCity', 'bus')->find($tripId);

        if (!$trip) {
            $twiml->message("❌ Voyage introuvable. Veuillez recommencer.");
            Cache::forget($cacheTrip);
            Cache::forget($cacheName);
            Cache::forget($cachePayment);
            return response($twiml, 200)->header('Content-Type', 'application/xml');
        }

        $departureCity = $trip->route->departureCity->name ?? 'N/A';
        $arrivalCity = $trip->route->arrivalCity->name ?? 'N/A';
        $busName = $trip->bus->registration_number ?? 'N/A';
        $departureTime = optional($trip->departure_at)->format('H:i') ?? 'N/A';
        $arrivalTime = optional($trip->arrival_at)->format('H:i') ?? 'N/A';
        $price = $trip->route->price ?? 'N/A';

        // Créer le ticket
        $ticket = Ticket::create([
            'trip_id' => $trip->id,
            'user_id' => null,
            'client_name' => $clientName,
            'price' => $price,
            'status' => 'paid',
        ]);

        // Message de confirmation
        $reply = "✅ *Paiement confirmé !*\n\n".
                 "🎫 *Votre billet est prêt*\n".
                 "• Trajet : *{$departureCity} → {$arrivalCity}*\n".
                 "• Départ : {$departureTime}\n".
                 "• Arrivée : {$arrivalTime}\n".
                 "• Bus : {$busName}\n".
                 "• Prix : *{$price} FCFA*\n".
                 "• Référence : *#{$trip->id}*\n\n".
                 "Merci pour votre confiance et bon voyage ! 🚌";

        $twiml->message($reply);

        // Générer QR code et PDF
        $ticketDir = storage_path('app/public/tickets');
        if (!file_exists($ticketDir)) mkdir($ticketDir, 0755, true);

        $qrPath = "{$ticketDir}/qr_{$from}_{$tripId}.png";
        QrCode::format('png')->size(200)->generate(json_encode([
            'ticket_id' => $ticket->id,
            'trip_id' => $trip->id,
            'departure' => $departureCity,
            'arrival' => $arrivalCity,
            'departure_time' => $departureTime,
            'arrival_time' => $arrivalTime
        ]), $qrPath);

        $pdfPath = "{$ticketDir}/billet_{$from}_{$tripId}.pdf";
        Pdf::loadView('tickets.template', [
            'trip' => $trip,
            'ticket' => $ticket,
            'qr_code_path' => $qrPath,
            'payment_method' => $paymentMethod
        ])->save($pdfPath);

        // Envoyer PDF via Twilio
        try {
            $twilioClient = new Client(config('services.twilio.sid'), config('services.twilio.token'));
            $twilioClient->messages->create($from, [
                'from' => config('services.twilio.whatsapp_from'),
                'body' => "📄 *Votre billet est prêt !*\n\n🎫 *Trajet :* {$departureCity} → {$arrivalCity}\n🧾 *Référence :* #{$trip->id}\n\nVeuillez trouver votre billet ci-dessous 👇",
                'mediaUrl' => [asset("storage/tickets/billet_{$from}_{$tripId}.pdf")]
            ]);

            Log::info("TWILIO SENT OK", ['to'=>$from]);
        } catch (\Exception $e) {
            Log::error("TWILIO ERROR", ["message"=>$e->getMessage()]);
        }

        // Nettoyer cache
        Cache::forget($cacheTrip);
        Cache::forget($cacheName);
        Cache::forget($cachePayment);

        return response($twiml, 200)->header('Content-Type','application/xml');
    }

    // ----------------------
    // Étape 4 : Réservation par ID
    // ----------------------
    if (ctype_digit($body)) {
        $tripId = intval($body);
        $trip = Trip::with('route.departureCity','route.arrivalCity','bus')->find($tripId);

        if (!$trip) {
            $twiml->message("❌ Voyage introuvable. Vérifiez l'ID.");
            return response($twiml,200)->header('Content-Type','application/xml');
        }

        $departureCity = $trip->route->departureCity->name ?? 'N/A';
        $arrivalCity = $trip->route->arrivalCity->name ?? 'N/A';
        $busName = $trip->bus->registration_number ?? 'N/A';
        $departureTime = optional($trip->departure_at)->format('H:i') ?? 'N/A';
        $arrivalTime = optional($trip->arrival_at)->format('H:i') ?? 'N/A';
        $price = $trip->route->price ?? 'N/A';

        $reply = "🎉 *Réservation en cours !*\n\n".
                 "🧾 *Référence :* #{$trip->id}\n".
                 "🚍 *Trajet :* {$departureCity} → {$arrivalCity}\n".
                 "• Départ : {$departureTime}\n".
                 "• Arrivée : {$arrivalTime}\n".
                 "• Bus : {$busName}\n".
                 "• Prix : *{$price} FCFA*\n\n".
                 "📝 *Veuillez indiquer votre nom complet pour finaliser la réservation.*";

        Cache::put($cacheTrip, $trip->id, now()->addMinutes(30));
        $twiml->message($reply);
        return response($twiml,200)->header('Content-Type','application/xml');
    }

    // ----------------------
    // Étape 5 : Recherche naturelle
    // ----------------------
    function convertirDateNaturelle($texte){
        $now = Carbon::now();
        $texte = Str::lower($texte);
        if (Str::contains($texte,'aujourd')) return $now->format('Y-m-d');
        if (Str::contains($texte,'demain')) return $now->copy()->addDay()->format('Y-m-d');
        if (Str::contains($texte,['apres-demain','après-demain'])) return $now->copy()->addDays(2)->format('Y-m-d');

        $jours=['lundi'=>1,'mardi'=>2,'mercredi'=>3,'jeudi'=>4,'vendredi'=>5,'samedi'=>6,'dimanche'=>0];
        foreach($jours as $mot=>$num) if(Str::contains($texte,$mot)) return $now->copy()->next($num)->format('Y-m-d');
        return null;
    }

    // Pattern "Ville1 -> Ville2 [date ou jour]"
    if (preg_match('/(.+)->(.+)/', $body, $matchSimple)) {
        $departure = trim($matchSimple[1]);
        $arrivalAndDate = trim($matchSimple[2]);

        if (preg_match('/^(\S+)\s*(.*)$/', $arrivalAndDate, $matchArrival)) {
            $arrival = trim($matchArrival[1]);
            $dateText = trim($matchArrival[2]);
            $date = convertirDateNaturelle($dateText);
        }

        if (!empty($date)) {
            return rechercherVoyages($departure, $arrival, $date, $twiml);
        }
    }

    // Pattern "Ville1 -> Ville2 YYYY-MM-DD"
    if (preg_match('/(.+)->(.+)\s+(\d{4}-\d{2}-\d{2})/', $body, $matches)) {
        [$all, $departure, $arrival, $date] = $matches;
        return rechercherVoyages(trim($departure), trim($arrival), $date, $twiml);
    }

    $twiml->message("❌ Format invalide.\nExemple :\n• 12\n• Bamako -> Kayes demain");
    return response($twiml,200)->header('Content-Type','application/xml');
});



// ----------------------
// Fonction recherche voyages
// ----------------------
function rechercherVoyages($departure,$arrival,$date,$twiml){
    $dateCarbon = Carbon::parse($date);
    $trips = Trip::select('trips.*')
    ->join('routes', 'trips.route_id', '=', 'routes.id')
    ->join('cities as dep', 'routes.departure_city_id', '=', 'dep.id')
    ->join('cities as arr', 'routes.arrival_city_id', '=', 'arr.id')
    ->whereDate('trips.departure_at', $dateCarbon)
    ->where('dep.name', 'like', "%{$departure}%")
    ->where('arr.name', 'like', "%{$arrival}%")
    ->with('route.departureCity', 'route.arrivalCity', 'bus')
    ->orderBy('trips.departure_at')
    ->get();

    if($trips->isEmpty()){
        $reply = "🚫 Aucun voyage trouvé pour {$departure} → {$arrival} le {$date}";
        $twiml->message($reply);
        return response($twiml,200)->header('Content-Type','application/xml');
    }

    $reply = "🚍 Voyages disponibles pour {$departure} → {$arrival} le {$date} :\n\n";
    foreach($trips as $trip){
       $reply .= "🧾 *Référence :* #{$trip->id}\n";
$reply .= "🕒 *Départ :* " . $trip->departure_at->format('H:i') . "\n";
$reply .= "🕒 *Arrivée :* " . $trip->arrival_at->format('H:i') . "\n";
$reply .= "🚌 *Bus :* " . ($trip->bus->registration_number ?? 'N/A') . "\n";
$reply .= "💵 *Prix :* " . ($trip->route->price ?? 'N/A') . " FCFA\n";
$reply .= "--------------------------------\n";

    }
    $reply .= "\n➡ Pour réserver, envoyez simplement Veuillez indiquer le numéro de référence du voyage pour continuer..";
    $twiml->message($reply);
    return response($twiml,200)->header('Content-Type','application/xml');
}




/**
 * --------------------------------------------------------------
 * 6. FONCTION : RECHERCHE DES VOYAGES
 * --------------------------------------------------------------
 */




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
