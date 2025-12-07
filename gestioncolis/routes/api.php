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
use App\Http\Controllers\TwilioWebhookController;

use App\Http\Controllers\PaymentWebhookController;

Route::post('/payments/callback', [PaymentWebhookController::class, 'handle'])
     ->name('payments.callback');

// Webhook recherche billets
Route::post('/webhook/tickets/search', [TicketController::class, 'webhookSearch']);






Route::post('/twilio/webhook', function(Request $request) {

    $from = $request->input('From');
    $body = trim($request->input('Body', ''));
    $bodyLower = Str::lower($body);
    $twiml = new MessagingResponse();

    Log::info('Webhook Twilio reçu', ['from' => $from, 'body' => $body]);

    // --- Clés cache ---
    $cacheDeparture  = "whatsapp_departure_{$from}";
    $cacheArrival    = "whatsapp_arrival_{$from}";
    $cacheTrip       = "whatsapp_trip_{$from}";
    $cacheName       = "whatsapp_name_{$from}";
    $cacheSeat       = "whatsapp_seat_{$from}";
    $cachePayment    = "whatsapp_payment_{$from}";
    $cacheExpire     = "whatsapp_expires_{$from}";

    $departureCity   = Cache::get($cacheDeparture);
    $arrivalCity     = Cache::get($cacheArrival);
    $tripId          = Cache::get($cacheTrip);
    $clientName      = Cache::get($cacheName);
    $seatNumber      = Cache::get($cacheSeat);
    $paymentMethod   = Cache::get($cachePayment);
    $expiresAt       = Cache::get($cacheExpire);

    function refreshSession($from) {
        Cache::put("whatsapp_expires_{$from}", now()->addMinutes(10), now()->addMinutes(10));
    }

    // Vérifier expiration
    if ($expiresAt && now()->gt($expiresAt)) {
        $twiml->message("⏰ Votre session a expiré. Veuillez recommencer.");
        Cache::forget($cacheDeparture);
        Cache::forget($cacheArrival);
        Cache::forget($cacheTrip);
        Cache::forget($cacheName);
        Cache::forget($cacheSeat);
        Cache::forget($cachePayment);
        Cache::forget($cacheExpire);
        return response($twiml, 200)->header('Content-Type','application/xml');
    }

    // --- Map des paiements ---
    $paymentMap = [
        '1' => 'Orange Money', '1️⃣' => 'Orange Money',
        '2' => 'Wave', '2️⃣' => 'Wave',
        '3' => 'Cash', '3️⃣' => 'Cash'
    ];

    // --------------------------
    // Étape 1 : Ville de départ
    // --------------------------
    if (!$departureCity) {
        Cache::put($cacheDeparture, $body, now()->addMinutes(10));
        refreshSession($from);
        $twiml->message("📍 Ville de départ enregistrée : {$body}\nMaintenant, tapez la ville d'arrivée :");
        return response($twiml, 200)->header('Content-Type','application/xml');
    }

    // --------------------------
    // Étape 2 : Ville d'arrivée
    // --------------------------
    if ($departureCity && !$arrivalCity) {
        Cache::put($cacheArrival, $body, now()->addMinutes(10));
        refreshSession($from);

        // Voyages pour les 5 prochains jours
        $voyages = [];
        for ($i = 0; $i < 5; $i++) {
            $date = now()->addDays($i)->format('Y-m-d');
            $trips = Trip::whereHas('route', function($q) use ($departureCity, $body) {
                $q->whereHas('departureCity', fn($q) => $q->where('name', $departureCity))
                  ->whereHas('arrivalCity', fn($q) => $q->where('name', $body));
            })->whereDate('departure_at', $date)->get();

            foreach ($trips as $trip) {
                $voyages[] = $trip;
            }
        }

        if (empty($voyages)) {
            $twiml->message("❌ Aucun voyage trouvé pour {$departureCity} -> {$body} dans les 5 prochains jours.");
            Cache::forget($cacheDeparture);
            Cache::forget($cacheArrival);
            return response($twiml, 200)->header('Content-Type','application/xml');
        }

        Cache::put("whatsapp_trip_options_{$from}", $voyages, now()->addMinutes(10));
$options = [];
$reply = "Voici les voyages disponibles pour {$departureCity} -> {$body} :\n";
foreach ($voyages as $index => $trip) {
    $num = $index + 1;
    $options[] = $trip->id;

    $departureTime = optional($trip->departure_at)->format('H:i') ?? 'N/A';
    $arrivalTime   = optional($trip->arrival_at)->format('H:i') ?? 'N/A';
    $busNumber     = $trip->bus->registration_number ?? 'N/A';
    $price         = number_format($trip->route->price ?? 0, 0, ',', ' ');
    $seatsAvailable= ($trip->bus->capacity ?? 0) - Ticket::where('trip_id', $trip->id)->count();

    $reply .= "🔹 *{$num}* - Réf : #{$trip->id}\n";
    $reply .= "🕒 Départ : {$departureTime} | Arrivée : {$arrivalTime}\n";
    $reply .= "🚌 Bus : {$busNumber} | 💺 Sièges dispo : {$seatsAvailable}\n";
    $reply .= "💵 Prix : {$price} FCFA\n";
    $reply .= "--------------------------------\n";
}

// Stocker les options dans le cache pour que l'utilisateur puisse choisir un numéro
$cacheOptionsKey = "whatsapp_trip_options_{$from}";
Cache::put($cacheOptionsKey, $options, now()->addMinutes(10));

// Envoyer le message final à l'utilisateur
$twiml->message($reply);
return response($twiml, 200)->header('Content-Type','application/xml');
    }

    // --------------------------
    // Étape 3 : Sélection du voyage par numéro
    // --------------------------
    if (ctype_digit($body) && !$tripId) {
        $selectedNumber = intval($body);
        $cacheOptionsKey = "whatsapp_trip_options_{$from}";
        if (Cache::has($cacheOptionsKey)) {
            $options = Cache::get($cacheOptionsKey);
            $selectedIndex = $selectedNumber - 1;
            if (isset($options[$selectedIndex])) {
                $tripId = $options[$selectedIndex];
                Cache::put($cacheTrip, $tripId, now()->addMinutes(10));
                refreshSession($from);

                $trip = Trip::with('route.departureCity','route.arrivalCity','bus')->find($tripId);
                if (!$trip) {
                    $twiml->message("❌ Voyage introuvable. Veuillez recommencer.");
                    return response($twiml, 200)->header('Content-Type','application/xml');
                }

                $twiml->message("🎉 Voyage sélectionné !\n📝 Veuillez indiquer votre nom complet pour finaliser la réservation.");
                return response($twiml, 200)->header('Content-Type','application/xml');
            }
        }
        $twiml->message("❌ Numéro invalide. Faites d'abord une recherche de voyage.");
        return response($twiml, 200)->header('Content-Type','application/xml');
    }

    // --------------------------
    // Étape 4 : Nom du client
    // --------------------------
   if ($tripId && !$clientName) {
    Cache::put($cacheName, $body, now()->addMinutes(10));
    refreshSession($from);

    // Récupérer le voyage avec le bus
    $trip = Trip::with('bus')->find($tripId);

    if (!$trip || !$trip->bus) {
        $twiml->message("❌ Voyage ou bus introuvable. Veuillez recommencer.");
        // Nettoyer le cache au besoin
        Cache::forget($cacheTrip);
        Cache::forget($cacheName);
        return response($twiml, 200)->header('Content-Type','application/xml');
    }

    // Calculer les sièges disponibles
    $availableSeats = range(1, $trip->bus->capacity);
    $reservedSeats = Ticket::where('trip_id', $tripId)->pluck('seat_number')->toArray();
    $freeSeats = array_diff($availableSeats, $reservedSeats);

    Cache::put("whatsapp_trip_seats_{$from}", $freeSeats, now()->addMinutes(10));

    $twiml->message("Merci {$body} ! 🪑 Choisissez un siège disponible :\n" . implode(", ", $freeSeats));
    return response($twiml, 200)->header('Content-Type','application/xml');
}


    // --------------------------
    // Étape 5 : Choix du siège
    // --------------------------
   // Étape choix siège optionnel
if ($tripId && $clientName && !Cache::has("whatsapp_seat_temp_{$from}") && !$seatNumber) {
    if ($body === '1') {
        $trip = Trip::with('bus')->find($tripId);
        $availableSeats = range(1, $trip->bus->capacity ?? 40);
        $reservedSeats = Ticket::where('trip_id', $tripId)->pluck('seat_number')->toArray();
        $freeSeats = array_diff($availableSeats, $reservedSeats);
        Cache::put("whatsapp_trip_seats_{$from}", $freeSeats, now()->addMinutes(10));
        $twiml->message("🪑 Choisissez un siège disponible :\n" . implode(", ", $freeSeats));
        Cache::put("whatsapp_seat_temp_{$from}", 'pending', now()->addMinutes(10));
        return response($twiml, 200)->header('Content-Type','application/xml');
    } elseif ($body === '2') {
        // Passe directement au paiement
        $trip = Trip::with('route')->find($tripId);
        $price = $trip->route->price ?? 0;
        Cache::put("whatsapp_trip_price_{$from}", $price, now()->addMinutes(10));
        $twiml->message("Pas de siège choisi. Prix : {$price} FCFA.\nChoisissez le mode de paiement :\n1️⃣ Orange Money\n2️⃣ Wave\n3️⃣ Cash");
        return response($twiml, 200)->header('Content-Type','application/xml');
    }
}

// Confirmation du siège si le client a choisi oui
if (Cache::has("whatsapp_seat_temp_{$from}") && $body !== '1' && $body !== '2') {
    $seat = intval($body);
    $availableSeats = Cache::get("whatsapp_trip_seats_{$from}", []);
    if (!in_array($seat, $availableSeats)) {
        $twiml->message("❌ Siège invalide ou déjà réservé. Choisissez un autre siège.");
        return response($twiml, 200)->header('Content-Type','application/xml');
    }

    Cache::put($cacheSeat, $seat, now()->addMinutes(10));
    $trip = Trip::with('route')->find($tripId);
    $price = ($trip->route->price ?? 0) + 200; // ajout 200 FCFA
    Cache::put("whatsapp_trip_price_{$from}", $price, now()->addMinutes(10));
    $twiml->message("✅ Siège confirmé. Nouveau prix : {$price} FCFA.\nChoisissez le mode de paiement :\n1️⃣ Orange Money\n2️⃣ Wave\n3️⃣ Cash");
    return response($twiml, 200)->header('Content-Type','application/xml');
}


    // --------------------------
    // Étape 6 : Choix du paiement
    // --------------------------
    if ($tripId && $clientName && $seatNumber && !$paymentMethod && isset($paymentMap[$bodyLower])) {
        $method = $paymentMap[$bodyLower];
        Cache::put($cachePayment, $method, now()->addMinutes(10));
        refreshSession($from);

        $paymentMessages = [
            'Orange Money' => "💳 Envoyez le paiement au 70XXXXXX et confirmez le code de transaction.",
            'Wave' => "💳 Envoyez le paiement au 66XXXXXX et confirmez le code.",
            'Cash' => "💵 Rendez-vous à la gare pour payer votre billet."
        ];

        $twiml->message($paymentMessages[$method]);
        return response($twiml, 200)->header('Content-Type','application/xml');
    }

    // --------------------------
    // Étape 7 : Confirmation + PDF + QR
    // --------------------------
    if ($tripId && $clientName && $seatNumber && $paymentMethod) {
        $trip = Trip::with('route.departureCity','route.arrivalCity','bus')->find($tripId);

        $departureCity = $trip->route->departureCity->name ?? 'N/A';
        $arrivalCity   = $trip->route->arrivalCity->name ?? 'N/A';
        $busName       = $trip->bus->registration_number ?? 'N/A';
        $departureTime = optional($trip->departure_at)->format('H:i') ?? 'N/A';
        $arrivalTime   = optional($trip->arrival_at)->format('H:i') ?? 'N/A';
        $price         = $trip->route->price ?? 'N/A';

        $ticket = Ticket::create([
            'trip_id' => $trip->id,
            'user_id' => null,
            'client_name' => $clientName,
            'seat_number' => $seatNumber,
            'price' => $price,
            'status' => 'paid',
        ]);

        $ticketDir = storage_path('app/public/tickets');
        if (!file_exists($ticketDir)) mkdir($ticketDir, 0755, true);

        $qrPath = "{$ticketDir}/qr_{$from}_{$tripId}.png";
        QrCode::format('png')->size(200)->generate(json_encode([
            'ticket_id' => $ticket->id,
            'trip_id' => $trip->id,
            'departure' => $departureCity,
            'arrival' => $arrivalCity,
            'departure_time' => $departureTime,
            'arrival_time' => $arrivalTime,
            'seat_number' => $seatNumber
        ]), $qrPath);

        $pdfPath = "{$ticketDir}/billet_{$from}_{$tripId}.pdf";
        Pdf::loadView('tickets.template', [
            'trip' => $trip,
            'ticket' => $ticket,
            'qr_code_path' => $qrPath,
            'payment_method' => $paymentMethod
        ])->save($pdfPath);

        try {
            $twilioClient = new Client(config('services.twilio.sid'), config('services.twilio.token'));
            $twilioClient->messages->create($from, [
                'from' => config('services.twilio.whatsapp_from'),
                'body' => "📄 Votre billet est prêt ! 🎫 Trajet : {$departureCity} → {$arrivalCity}, Réf : #{$trip->id}, Siège : {$seatNumber}",
                'mediaUrl' => [asset("storage/tickets/billet_{$from}_{$tripId}.pdf")]
            ]);
            Log::info("TWILIO SENT OK", ['to'=>$from]);
        } catch (\Exception $e) {
            Log::error("TWILIO ERROR", ["message"=>$e->getMessage()]);
        }

        // Nettoyer cache
        Cache::forget($cacheDeparture);
        Cache::forget($cacheArrival);
        Cache::forget($cacheTrip);
        Cache::forget($cacheName);
        Cache::forget($cacheSeat);
        Cache::forget($cachePayment);
        Cache::forget($cacheExpire);
        Cache::forget("whatsapp_trip_seats_{$from}");

        $twiml->message("✅ Paiement confirmé et billet envoyé ! Bon voyage 🚌");
        return response($twiml, 200)->header('Content-Type','application/xml');
    }

    $twiml->message("❌ Format invalide. Veuillez suivre le flux indiqué :\n1. Tapez la ville de départ\n2. Tapez la ville d'arrivée");
    return response($twiml, 200)->header('Content-Type','application/xml');
});




Route::post('/twilio/webhook2', [TwilioWebhookController::class, 'handle']);

// ----------------------
// Fonction recherche voyages


function rechercherVoyages($departure, $arrival, $date, $twiml, $from = null) {
    $departure = trim($departure);
    $arrival   = trim($arrival);

    // Séparer ville et date naturelle/format exact

    try {
        $dateCarbon = Carbon::parse($date);
    } catch (\Exception $e) {
        $twiml->message("❌ Date invalide : {$date}");
        return response($twiml, 200)->header('Content-Type','application/xml');
    }

    // Requête voyages
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

    if ($trips->isEmpty()) {
        $twiml->message("🚫 Aucun voyage trouvé pour *{$departure} → {$arrival}* le *{$dateCarbon->format('d/m/Y')}*.");
        return response($twiml, 200)->header('Content-Type','application/xml');
    }

    // Construire le message
    $reply = "🚍 *Voyages disponibles pour {$departure} → {$arrival} le {$dateCarbon->format('d/m/Y')}* :\n\n";
    $options = [];

    foreach ($trips as $index => $trip) {
        $num = $index + 1;
        $options[] = $trip->id;

        $departureTime = optional($trip->departure_at)->format('H:i') ?? 'N/A';
        $arrivalTime   = optional($trip->arrival_at)->format('H:i') ?? 'N/A';
        $busNumber     = $trip->bus->registration_number ?? 'N/A';
        $price         = number_format($trip->route->price ?? 0, 0, ',', ' ');
        $seatsAvailable= ($trip->bus->capacity ?? 0) - Ticket::where('trip_id', $trip->id)->count();

        $reply .= "🔹 *{$num}* - Réf : #{$trip->id}\n";
        $reply .= "🕒 Départ : {$departureTime} | Arrivée : {$arrivalTime}\n";
        $reply .= "🚌 Bus : {$busNumber} | 💺 Sièges dispo : {$seatsAvailable}\n";
        $reply .= "💵 Prix : {$price} FCFA\n";
        $reply .= "--------------------------------\n";
    }

    $reply .= "\n➡ Pour réserver, envoyez le numéro correspondant au voyage souhaité.";

    if ($from) {
        Cache::put("whatsapp_trip_options_{$from}", $options, now()->addMinutes(10));
    }

    $twiml->message($reply);
    return response($twiml, 200)->header('Content-Type','application/xml');
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
