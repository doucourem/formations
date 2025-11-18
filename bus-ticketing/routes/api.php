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

// Webhook recherche billets
Route::post('/webhook/tickets/search', [TicketController::class, 'webhookSearch']);

// Webhook WhatsApp principal

Route::post('/twilio/webhook', function(Request $request) {
    $from = $request->input('From');
    $body = trim($request->input('Body', ''));
    $bodyLower = Str::lower($body);
    $twiml = new MessagingResponse();

    Log::info('Webhook Twilio reçu', ['from'=>$from, 'body'=>$body]);

    // ----------------------
    // 1️⃣ Paiement (chiffre ou emoji)
    // ----------------------
    $paymentMap = [
        '1' => 'Orange Money', '1️⃣' => 'Orange Money',
        '2' => 'Wave', '2️⃣' => 'Wave',
        '3' => 'Cash', '3️⃣' => 'Cash'
    ];
    $cacheKey = "whatsapp_trip_{$from}";
    $tripId = Cache::get($cacheKey);



if ($tripId && isset($paymentMap[$bodyLower])) {
    $trip = Trip::with('route.departureCity','route.arrivalCity','bus')->find($tripId);

    if (!$trip) {
        $twiml->message("❌ Voyage introuvable. Veuillez recommencer.");
        Cache::forget($cacheKey);
        return response($twiml,200)->header('Content-Type','application/xml');
    }

    $departureCity = $trip->route->departureCity->name ?? 'N/A';
    $arrivalCity   = $trip->route->arrivalCity->name ?? 'N/A';
    $busName       = $trip->bus->registration_number ?? 'N/A';
    $departureTime = optional($trip->departure_at)->format('H:i') ?? 'N/A';
    $arrivalTime   = optional($trip->arrival_at)->format('H:i') ?? 'N/A';
    $price         = $trip->route->price ?? 'N/A';
    $paymentMethod = $paymentMap[$bodyLower];

    // ✅ Message de confirmation
    $reply  = "✅ Paiement reçu via {$paymentMethod} !\n\n";
    $reply .= "🎫 Billet confirmé :\n";
    $reply .= "{$departureCity} → {$arrivalCity}\n";
    $reply .= "Départ : {$departureTime}\nArrivée : {$arrivalTime}\n";
    $reply .= "Bus : {$busName}\nPrix : {$price} FCFA\nID : {$trip->id}\n\n";
    $reply .= "Merci et bon voyage ! 🚌";
 

    // 1️⃣ Générer QR code
    $qrData = json_encode([
        'trip_id' => $trip->id,
        'departure' => $departureCity,
        'arrival' => $arrivalCity,
        'departure_time' => $departureTime,
        'arrival_time' => $arrivalTime
    ]);

    $ticketDir = storage_path('app/public/tickets');
if (!file_exists($ticketDir)) {
    mkdir($ticketDir, 0755, true);
}

    $qrPath = storage_path("app/public/tickets/qr_{$from}_{$tripId}.png");
    QrCode::format('png')->size(200)->generate($qrData, $qrPath);

    // 2️⃣ Générer PDF billet
    $pdf = Pdf::loadView('tickets.template', [
        'trip' => $trip,
        'qr_code_path' => $qrPath,
        'payment_method' => $paymentMethod
    ]);
    $pdfPath = storage_path("app/public/tickets/billet_{$from}_{$tripId}.pdf");
    $pdf->save($pdfPath);

    // 3️⃣ Envoyer PDF via WhatsApp Twilio
    $twilioSid = config('services.twilio.sid');
    $twilioToken = config('services.twilio.token');
    $twilioFrom = config('services.twilio.whatsapp_from'); // ex: 'whatsapp:+14155238886'
    $twilioClient = new Client($twilioSid, $twilioToken);

  try {
    $mediaUrl = asset("storage/tickets/billet_{$from}_{$tripId}.pdf");

    Log::info("TWILIO TRY", [
        "to" => $from,
        "from" => $twilioFrom,
        "media" => $mediaUrl
    ]);

    $twilioClient->messages->create($from, [
        'from' => $twilioFrom,
        'body' => "📄 Voici votre billet pour {$departureCity} → {$arrivalCity} (ID: {$trip->id})",
        'mediaUrl' => [$mediaUrl]
    ]);

    Log::info("TWILIO SENT OK");

} catch (\Exception $e) {

    Log::error("TWILIO ERROR", [
        "message" => $e->getMessage(),
        "line" => $e->getLine(),
        "file" => $e->getFile()
    ]);
}


    Cache::forget($cacheKey);
    return response($twiml,200)->header('Content-Type','application/xml');
}


    // ----------------------
    // 2️⃣ Réservation par ID de voyage
    // ----------------------
    if (ctype_digit($body)) {
        $tripId = intval($body);
        $trip = Trip::with('route.departureCity','route.arrivalCity','bus')->find($tripId);

        if (!$trip) {
            $reply = "❌ Voyage introuvable. Vérifiez l'ID.";
        } else {
            $departureCity = $trip->route->departureCity->name ?? 'N/A';
            $arrivalCity   = $trip->route->arrivalCity->name ?? 'N/A';
            $busName       = $trip->bus->registration_number ?? 'N/A';
            $departureTime = optional($trip->departure_at)->format('H:i') ?? 'N/A';
            $arrivalTime   = optional($trip->arrival_at)->format('H:i') ?? 'N/A';
            $price         = $trip->route->price ?? 'N/A';

            $reply  = "🎉 Réservation en cours !\n";
            $reply .= "ID : {$trip->id}\n";
            $reply .= "{$departureCity} → {$arrivalCity}\n";
            $reply .= "Départ : {$departureTime}\nArrivée : {$arrivalTime}\n";
            $reply .= "Bus : {$busName}\nPrix : {$price} FCFA\n\n";
            $reply .= "Choisissez le mode de paiement :\n1️⃣ Orange Money\n2️⃣ Wave\n3️⃣ Cash à la gare";

            Cache::put($cacheKey, $trip->id, now()->addMinutes(30)); // stock temporaire
        }

        $twiml->message($reply);
        return response($twiml,200)->header('Content-Type','application/xml');
    }

    // ----------------------
    // 3️⃣ Conversion des dates naturelles
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

    // ----------------------
    // 4️⃣ Recherche voyages
    // ----------------------
    if(preg_match('/(.+)->(.+)/',$body,$matchSimple)){
        $departure = trim($matchSimple[1]);
        $arrival = trim($matchSimple[2]);
        $date = convertirDateNaturelle($body);
        if($date) return rechercherVoyages($departure,$arrival,$date,$twiml);
    }

    if(preg_match('/(.+)->(.+)\s+(\d{4}-\d{2}-\d{2})/',$body,$matches)){
        [$all,$departure,$arrival,$date] = $matches;
        return rechercherVoyages(trim($departure),trim($arrival),$date,$twiml);
    }

    $reply = "❌ Format invalide.\nExemples :\n• Bamako -> Kayes demain\n• Kayes -> Bamako samedi\n• Mopti -> Bamako après-demain";
    $twiml->message($reply);
    return response($twiml,200)->header('Content-Type','application/xml');

});

// ----------------------
// Fonction recherche voyages
// ----------------------
function rechercherVoyages($departure,$arrival,$date,$twiml){
    $dateCarbon = Carbon::parse($date);
    $trips = Trip::with('route.departureCity','route.arrivalCity','bus')
        ->whereDate('departure_at',$dateCarbon)
       ->orderBy('departure_at')
        ->get();

    if($trips->isEmpty()){
        $reply = "🚫 Aucun voyage trouvé pour {$departure} → {$arrival} le {$date}";
        $twiml->message($reply);
        return response($twiml,200)->header('Content-Type','application/xml');
    }

    $reply = "🚍 Voyages disponibles pour {$departure} → {$arrival} le {$date} :\n\n";
    foreach($trips as $trip){
        $reply .= "🆔 {$trip->id}\n";
        $reply .= "🕒 Départ : ".$trip->departure_at->format('H:i')."\n";
        $reply .= "🕒 Arrivée : ".$trip->arrival_at->format('H:i')."\n";
        $reply .= "🚌 Bus : ".($trip->bus->registration_number ?? 'N/A')."\n";
        $reply .= "💵 Prix : ".($trip->route->price ?? 'N/A')." FCFA\n";
        $reply .= "--------------------------------\n";
    }
    $reply .= "\n➡ Pour réserver, envoyez simplement l’ID du voyage.";
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
