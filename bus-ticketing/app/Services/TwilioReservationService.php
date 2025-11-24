<?php 
namespace App\Services;

use App\Models\Trip;
use App\Models\Ticket;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;
use Twilio\TwiML\MessagingResponse;
use Twilio\Rest\Client;
use SimpleSoftwareIO\QrCode\Facades\QrCode;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Storage;

class TwilioReservationService
{
    const TIMEOUT_MINUTES = 10;

    protected Client $twilioClient;
    protected string $twilioFrom;

    public function __construct()
    {
        $sid = config('services.twilio.sid');
        $token = config('services.twilio.token');
        $this->twilioFrom = config('services.twilio.from');
        $this->twilioClient = new Client($sid, $token);
    }

    /**
     * Point d'entrée principal
     */
    public function processIncomingMessage($request)
    {
        $from = $request->input('From');
        $body = trim($request->input('Body', ''));
        $lower = Str::lower($body);
        $twiml = new MessagingResponse();

        Log::info("TWILIO WEBHOOK", compact("from", "body"));

        // contexte
        $state   = Cache::get("state:$from", 'idle');
        $tripId  = Cache::get("trip:$from");
        $name    = Cache::get("name:$from");
        $payment = Cache::get("payment:$from");
        $last    = Cache::get("last:$from");

        // timeout
        if ($last && Carbon::parse($last)->addMinutes(self::TIMEOUT_MINUTES)->isPast()) {
            $this->resetCache($from);
            $this->sendWhatsAppText($from, "⏳ Session expirée (10 minutes). Recommencez depuis le début.");
            return $this->twiml($twiml);
        }

        Cache::put("last:$from", now(), now()->addMinutes(self::TIMEOUT_MINUTES));

        // commandes spéciales (modif / annulation / preuve paiement)
        if ($this->isCancelCommand($body)) {
            return $this->handleCancellationCommand($from, $body, $twiml);
        }

        if ($this->isModifyCommand($body)) {
            return $this->handleModificationCommand($from, $body, $twiml);
        }

        if ($this->isPaymentProof($body)) {
            return $this->processPaymentProof($from, $body, $twiml);
        }

        // state machine classique (ID -> NAME -> PAYMENT -> FINALIZE)
        switch ($state) {
            case 'waiting_trip_id':
                if (ctype_digit($body)) {
                    return $this->startReservationById($from, $body, $twiml);
                }
                break;

            case 'waiting_name':
                if ($body) {
                    return $this->captureName($from, $body, $twiml);
                }
                break;

            case 'waiting_payment':
                if ($this->isValidPayment($lower)) {
                    return $this->capturePayment($from, $lower, $twiml);
                }
                // accept payment code submission too
                break;

            case 'finalizing':
                return $this->finalizeReservation($from, $twiml);

            default:
                break;
        }

        // par défaut : si c'est un id
        if (ctype_digit($body)) {
            Cache::put("state:$from", "waiting_trip_id");
            return $this->startReservationById($from, $body, $twiml);
        }

        // texte naturel
        if ($this->isNaturalRequest($body)) {
            return $this->processNaturalRequest($body, $twiml);
        }

        // sinon -> instructions
        Cache::put("state:$from", "waiting_trip_id");
        $this->sendWhatsAppText($from, "❌ Format invalide.\nExemples :\n• 12\n• Bamako -> Mopti demain\nPour annuler une réservation : ANNULER #123");
        return $this->twiml($twiml);
    }

    /* ----------------------------------------
       SUPPORT TEMPLATES WHATSAPP
       - stocke les templates dans config('whatsapp.templates')
       - sendWhatsAppTemplate($to, 'ticket_sent', ['NAME'=>'Moussa', 'REF'=>'#123'], $mediaUrl)
    ---------------------------------------- */

    public function sendWhatsAppTemplate(string $to, string $templateKey, array $vars = [], string $mediaUrl = null): array
    {
        // récupérer template (ex: "Bonjour {{NAME}}, votre billet {{REF}} ...")
        $templates = config('whatsapp.templates', []);
        $tpl = $templates[$templateKey] ?? null;
        if (!$tpl) {
            Log::warning("Template introuvable: $templateKey");
            return ['success' => false, 'error' => 'template_not_found'];
        }

        // remplacer variables
        $body = $this->renderTemplate($tpl['body'], $vars);

        // media optionnel (image/pdf)
        $media = $mediaUrl ? [$mediaUrl] : null;

        try {
            $recipient = str_contains($to, 'whatsapp:') ? $to : "whatsapp:".$to;
            $params = [
                'from' => "whatsapp:{$this->twilioFrom}",
                'body' => $body,
            ];
            if ($media) $params['mediaUrl'] = $media;

            $resp = $this->twilioClient->messages->create($recipient, $params);
            Log::info("Template envoyé", ['to'=>$to,'template'=>$templateKey,'sid'=>$resp->sid]);
            return ['success'=>true,'sid'=>$resp->sid];
        } catch (\Exception $e) {
            Log::error("Erreur envoi template", ['err'=>$e->getMessage()]);
            return ['success'=>false,'error'=>$e->getMessage()];
        }
    }

    protected function renderTemplate(string $tpl, array $vars = []): string
    {
        foreach ($vars as $k => $v) {
            $tpl = str_replace("{{{$k}}}", $v, $tpl);
        }
        return $tpl;
    }

    /* ----------------------------------------
       QR + PDF + envoi automatique (WhatsApp)
       - create QR, render PDF, upload (storage public), send via Twilio
    ---------------------------------------- */

    protected function sendTicketPdf(string $to, Trip $trip, Ticket $ticket, string $paymentMethod = null)
    {
        $ticketDir = storage_path('app/public/tickets');
        if (!file_exists($ticketDir)) mkdir($ticketDir, 0755, true);

        // QR - on encode info minimales
        $qrData = json_encode([
            'ticket_id' => $ticket->id,
            'trip_id' => $trip->id,
            'name' => $ticket->client_name,
        ]);

        $qrFilename = "qr_{$ticket->id}.png";
        $qrPath = "{$ticketDir}/{$qrFilename}";
        QrCode::format('png')->size(300)->generate($qrData, $qrPath);

        // PDF
        $pdfFilename = "billet_{$ticket->id}.pdf";
        $pdfPath = "{$ticketDir}/{$pdfFilename}";
        $pdf = Pdf::loadView('tickets.template', [
            'trip' => $trip,
            'ticket' => $ticket,
            'qr_path' => $qrPath,
            'payment_method' => $paymentMethod
        ])->save($pdfPath);

        // s'il faut stocker / utiliser Storage facade
        $publicUrl = asset("storage/tickets/{$pdfFilename}");

        // Envoi via Twilio (WhatsApp)
        try {
            $recipient = str_contains($to, 'whatsapp:') ? $to : "whatsapp:".$to;
            $message = "🎫 Votre billet #{$ticket->id} pour {$trip->route->departureCity->name} → {$trip->route->arrivalCity->name} est prêt. Voir pièce jointe.";
            $resp = $this->twilioClient->messages->create($recipient, [
                'from' => "whatsapp:{$this->twilioFrom}",
                'body' => $message,
                'mediaUrl' => [$publicUrl]
            ]);
            Log::info("Billet envoyé", ['to'=>$to,'ticket'=>$ticket->id,'sid'=>$resp->sid]);
            return ['success'=>true,'sid'=>$resp->sid,'url'=>$publicUrl];
        } catch (\Exception $e) {
            Log::error("Erreur envoi billet", ['err'=>$e->getMessage()]);
            return ['success'=>false,'error'=>$e->getMessage()];
        }
    }

    /* ----------------------------------------
       PAIEMENT: wrapper OrangeMoney / Wave (basic)
       - createPaymentRequest() : initie un paiement côté opérateur
       - verifyTransaction() : vérifier via webhook ou polling
       NOTE : adapter les endpoints/params selon la doc opérateur.
    ---------------------------------------- */

    public function createOrangePaymentRequest(string $phone, float $amount, string $externalRef): array
    {
        $om = new OrangeMoneyService();
        return $om->createPayment($phone, $amount, $externalRef);
    }

    public function createWavePaymentRequest(string $phone, float $amount, string $externalRef): array
    {
        $ws = new WaveService();
        return $ws->createPayment($phone, $amount, $externalRef);
    }

    public function verifyOrangeTransaction(string $transactionId): array
    {
        $om = new OrangeMoneyService();
        return $om->verify($transactionId);
    }

    public function verifyWaveTransaction(string $transactionId): array
    {
        $ws = new WaveService();
        return $ws->verify($transactionId);
    }

    /* ----------------------------------------
       COMMANDES: Modifications & Annulations
       - ANNULER #123
       - MODIFIER #123 nom=Jean;date=2025-12-10
    ---------------------------------------- */

    protected function isCancelCommand(string $body): bool
    {
        return (bool) preg_match('/^\s*ANNULER\s+#?(\d+)/i', $body);
    }

    protected function isModifyCommand(string $body): bool
    {
        return (bool) preg_match('/^\s*MODIFIER\s+#?(\d+)/i', $body);
    }

    protected function handleCancellationCommand($from, $body, $twiml)
    {
        if (!preg_match('/^\s*ANNULER\s+#?(\d+)/i', $body, $m)) {
            $this->sendWhatsAppText($from, "Format d'annulation invalide. Exemple : ANNULER #123");
            return $this->twiml($twiml);
        }
        $ticketId = intval($m[1]);
        $ticket = Ticket::find($ticketId);
        if (!$ticket) {
            $this->sendWhatsAppText($from, "Ticket #{$ticketId} introuvable.");
            return $this->twiml($twiml);
        }

        // Politique d'annulation selon ton business (remboursement, frais...)
        $ticket->status = 'cancelled';
        $ticket->save();

        $this->sendWhatsAppText($from, "✅ Billet #{$ticketId} annulé avec succès.");
        Log::info("Ticket annulé via WhatsApp", ['ticket'=>$ticketId,'by'=>$from]);

        return $this->twiml($twiml);
    }

    protected function handleModificationCommand($from, $body, $twiml)
    {
        if (!preg_match('/^\s*MODIFIER\s+#?(\d+)\s*(.*)/i', $body, $m)) {
            $this->sendWhatsAppText($from, "Format de modification invalide.\nEx: MODIFIER #123 nom=Ali;date=2025-12-10");
            return $this->twiml($twiml);
        }

        $ticketId = intval($m[1]);
        $params = trim($m[2]); // "nom=Jean;date=2025-12-10"

        $ticket = Ticket::find($ticketId);
        if (!$ticket) {
            $this->sendWhatsAppText($from, "Ticket #{$ticketId} introuvable.");
            return $this->twiml($twiml);
        }

        // parser params simples
        $pairs = array_filter(array_map('trim', explode(';', $params)));
        foreach ($pairs as $pair) {
            [$k,$v] = array_map('trim', explode('=', $pair.'=')); // safe
            if (!$k) continue;
            switch (Str::lower($k)) {
                case 'nom':
                case 'name':
                    $ticket->client_name = $v;
                    break;
                case 'date':
                    // selon ton modèle de ticket/trip -> ici on stocke en metadata ou on met à jour trip
                    $ticket->meta = array_merge($ticket->meta ?? [], ['requested_date' => $v]);
                    break;
            }
        }
        $ticket->save();

        $this->sendWhatsAppText($from, "✅ Billet #{$ticketId} modifié. Nouvelles infos enregistrées.");
        Log::info("Ticket modifié via WhatsApp", ['ticket'=>$ticketId,'by'=>$from,'params'=>$params]);

        return $this->twiml($twiml);
    }

    /* ----------------------------------------
       Traitement de preuve de paiement (ex: user envoie code OM)
       - on accepte un format: CODE 123456 ou OM 987654
    ---------------------------------------- */
    protected function isPaymentProof(string $body): bool
    {
        return preg_match('/\b(?:code|om|wave)\b\s*[:#]?\s*(\w+)/i', $body) === 1;
    }

    protected function processPaymentProof($from, $body, $twiml)
    {
        if (!preg_match('/\b(?:code|om|wave)\b\s*[:#]?\s*(\w+)/i', $body, $m)) {
            $this->sendWhatsAppText($from, "Format de preuve invalide. Envoyez: CODE 123456");
            return $this->twiml($twiml);
        }

        $code = $m[1];
        // log et stockage temporaire
        Cache::put("payment_proof:$from", $code, now()->addMinutes(30));
        $this->sendWhatsAppText($from, "✅ Preuve reçue: {$code}. Nous vérifions le paiement et vous confirmons sous peu.");

        // Ici : vérifier via API opérateur ou manuel
        Log::info("Preuve paiement reçue", ['from'=>$from,'code'=>$code]);

        // pour l'exemple on marque payment ok et finalize
        Cache::put("payment:$from", "Orange Money", now()->addMinutes(30));
        Cache::put("state:$from", "finalizing");

        return $this->twiml($twiml);
    }

    /* ----------------------------------------
       Helpers: envoi texte WhatsApp simple
    ---------------------------------------- */

    protected function sendWhatsAppText(string $to, string $message)
    {
        try {
            $recipient = str_contains($to, 'whatsapp:') ? $to : "whatsapp:".$to;
            $resp = $this->twilioClient->messages->create($recipient, [
                'from' => "whatsapp:{$this->twilioFrom}",
                'body' => $message
            ]);
            Log::info("WhatsApp envoyé", ['to'=>$to,'sid'=>$resp->sid]);
            return ['success'=>true,'sid'=>$resp->sid];
        } catch (\Exception $e) {
            Log::error("Erreur envoi WhatsApp", ['err'=>$e->getMessage()]);
            return ['success'=>false,'error'=>$e->getMessage()];
        }
    }

    /* ----------------------------------------
       Fonctions existantes utiles (startReservationById, createTicket, resetCache...)
       - j'assume createTicket() existe déjà; si non, méthode simple ci-dessous
    ---------------------------------------- */

    protected function createTicket(Trip $trip, string $name): Ticket
    {
        return Ticket::create([
            'trip_id' => $trip->id,
            'user_id' => null,
            'client_name' => $name,
            'price' => $trip->route->price ?? 0,
            'status' => 'paid'
        ]);
    }

    private function startReservationById($from, $tripId, $twiml)
    {
        $trip = Trip::with('route.departureCity','route.arrivalCity','bus')->find($tripId);

        if (!$trip) {
            $this->sendWhatsAppText($from, "❌ Voyage introuvable.");
            return $this->twiml($twiml);
        }

        Cache::put("trip:$from", $tripId, now()->addMinutes(30));
        Cache::put("state:$from", "waiting_name");
        Cache::put("step:$from", 1);

        $msg =
            "🧾 *Réservation #{$trip->id}*\n\n".
            "Trajet : {$trip->route->departureCity->name} → {$trip->route->arrivalCity->name}\n".
            "Départ : {$trip->departure_at->format('H:i')}\n".
            "Prix : {$trip->route->price} FCFA\n\n".
            "👉 Étape 1/3 : Envoyez *votre nom complet*.";

        $this->sendWhatsAppText($from, $msg);
        return $this->twiml($twiml);
    }

    protected function captureName($from, $name, $twiml)
    {
        Cache::put("name:$from", $name, now()->addMinutes(30));
        Cache::put("state:$from", "waiting_payment");
        Cache::put("step:$from", 2);

        $this->sendWhatsAppText($from, "Merci {$name} 🙏\nÉtape 2/3\nChoisissez le mode de paiement :\n1️⃣ Orange Money\n2️⃣ Wave\n3️⃣ Cash");
        return $this->twiml($twiml);
    }

    protected function isValidPayment($value)
    {
        return in_array($value, ['1','2','3','1️⃣','2️⃣','3️⃣','orange','wave','cash']);
    }

    protected function capturePayment($from, $value, $twiml)
    {
        $paymentMap = [
            '1'=>'Orange Money','1️⃣'=>'Orange Money','orange'=>'Orange Money',
            '2'=>'Wave','2️⃣'=>'Wave','wave'=>'Wave',
            '3'=>'Cash','3️⃣'=>'Cash','cash'=>'Cash',
        ];

        $method = $paymentMap[$value] ?? 'Cash';
        Cache::put("payment:$from", $method, now()->addMinutes(30));
        Cache::put("state:$from", "finalizing");
        Cache::put("step:$from", 3);

        $msg = match($method) {
            'Orange Money' => "💳 Orange Money sélectionné.\nEnvoyez le paiement au 70XXXXXX, puis envoyez le code reçu (ex: CODE 123456).",
            'Wave'         => "💳 Wave sélectionné.\nEnvoyez le paiement au 66XXXXXX, puis envoyez le code reçu (ex: CODE 123456).",
            default        => "💵 Cash sélectionné.\nPayez à la gare avant le départ."
        };

        $this->sendWhatsAppText($from, "Étape 3/3\n".$msg);
        return $this->twiml($twiml);
    }

    protected function finalizeReservation($from, $twiml)
    {
        $tripId  = Cache::get("trip:$from");
        $name    = Cache::get("name:$from");
        $payment = Cache::get("payment:$from");

        $trip = Trip::with('route.departureCity','route.arrivalCity','bus')->find($tripId);

        if (!$trip) {
            $this->sendWhatsAppText($from, "❌ Voyage introuvable. Recommencez.");
            $this->resetCache($from);
            return $this->twiml($twiml);
        }

        $ticket = $this->createTicket($trip, $name);
        $res = $this->sendTicketPdf($from, $trip, $ticket, $payment);

        // envoyer template + pdf
        $this->sendWhatsAppTemplate($from, 'ticket_sent', [
            'NAME' => $name,
            'REF' => "#{$ticket->id}",
            'ROUTE' => "{$trip->route->departureCity->name} → {$trip->route->arrivalCity->name}",
            'TIME' => optional($trip->departure_at)->format('H:i')
        ], $res['url'] ?? null);

        $this->resetCache($from);
        return $this->twiml($twiml);
    }

    /* ----------------------------------------
       Cache reset
    ---------------------------------------- */

    private function resetCache($from)
    {
        Cache::forget("trip:$from");
        Cache::forget("name:$from");
        Cache::forget("payment:$from");
        Cache::forget("state:$from");
        Cache::forget("step:$from");
        Cache::forget("last:$from");
        Cache::forget("payment_proof:$from");
    }


    public function sendTicketAfterPayment(Ticket $ticket)
{
    $client = new Client(env('TWILIO_SID'), env('TWILIO_AUTH_TOKEN'));

    $phone  = $ticket->customer_phone;
    $trip   = $ticket->trip;

    $message = "🎫 *Paiement confirmé !*\nVotre billet est prêt.\n".
               "• Trajet : {$trip->route->departureCity->name} → {$trip->route->arrivalCity->name}\n".
               "• Départ : {$trip->departure_at->format('d/m H:i')}\n".
               "• Réf : TICKET-{$ticket->id}";

    // Envoi du message
    $client->messages->create("whatsapp:$phone", [
        'from' => "whatsapp:" . env('TWILIO_PHONE'),
        'body' => $message,
    ]);

    // Génération et envoi du PDF
    $this->sendTicketPdf($ticket, $phone);
}

}

class OrangeMoneyService
{
    public function createPayment($phone, $amount, $ref)
    {
        // Appel réel à l'API Orange ici
        // Retour simulé
        return ['success'=>true,'external_id'=>'OM_'.time(),'amount'=>$amount];
    }

    public function verify($transactionId)
    {
        // Polling ou webhook check
        return ['success'=>true,'status'=>'confirmed'];
    }
}

class WaveService
{
    public function createPayment($phone, $amount, $ref)
    {
        return ['success'=>true,'external_id'=>'WAVE_'.time(),'amount'=>$amount];
    }

    public function verify($transactionId)
    {
        return ['success'=>true,'status'=>'confirmed'];
    }
}
