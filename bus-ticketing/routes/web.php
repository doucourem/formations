<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BusController;
use App\Http\Controllers\AgencyController;
use App\Http\Controllers\RouteController as TripRouteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\NotificationController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Page d'accueil
Route::get('/', function () {
    return Inertia::render('HomePage');
})->name('home');

// Webhook pour rechercher les billets (public)
Route::post('/webhook/tickets/search', [TicketController::class, 'webhookSearch']);

// Webhook Twilio WhatsApp (public)
Route::post('/twilio/webhook', function(Request $request) {
    $from = $request->input('From'); // numéro WhatsApp utilisateur
    $body = $request->input('Body'); // message utilisateur

    preg_match('/(.+)->(.+)\s+(\d{4}-\d{2}-\d{2})/', $body, $matches);

    if (!$matches) {
        $reply = "Format invalide. Exemple : Bamako -> Kayes 2025-11-15";
    } else {
        [$all, $departure, $arrival, $date] = $matches;

        $ticketsResponse = app(TicketController::class)
            ->webhookSearch(new Request([
                'departure' => trim($departure),
                'arrival' => trim($arrival),
                'date' => trim($date),
            ]));

        $tickets = $ticketsResponse->getData()->tickets;

        if (count($tickets) === 0) {
            $reply = "Aucun billet trouvé pour $departure -> $arrival le $date";
        } else {
            $reply = "Billets disponibles :\n";
            foreach ($tickets as $t) {
                $reply .= "ID: {$t->ticket_id}, Départ: {$t->departure_time}, Arrivée: {$t->arrival_time}, Siège: {$t->seat_number}, Prix: {$t->price} FCFA\n";
            }
        }
    }

    $twiml = new \Twilio\TwiML\MessagingResponse();
    $twiml->message($reply);
    return response($twiml, 200)->header('Content-Type', 'application/xml');
});


Route::post('/twilio/select-ticket', function(Request $request) {
    $from = $request->input('From');
    $body = $request->input('Body'); // l'utilisateur envoie l'ID du billet

    $ticketId = trim($body);

    $ticket = \App\Models\Ticket::with('trip.route', 'startStop', 'endStop')->find($ticketId);

    if (!$ticket) {
        $reply = "Billet introuvable. Veuillez vérifier l'ID.";
    } elseif ($ticket->status !== 'reserved') {
        $reply = "Ce billet n'est pas disponible.";
    } else {
        // Marquer le billet comme réservé par ce numéro (ou user)
        $ticket->update([
            'status' => 'paid', // ou 'reserved_by_whatsapp' selon ton workflow
            'client_name' => $from,
        ]);

        $reply = "Billet ID {$ticket->id} réservé avec succès ✅\n";
        $reply .= "Départ: {$ticket->trip->route->departureCity->name}\n";
        $reply .= "Arrivée: {$ticket->trip->route->arrivalCity->name}\n";
        $reply .= "Siège: {$ticket->seat_number}\n";
        $reply .= "Prix: {$ticket->price} FCFA";
    }

    $twiml = new \Twilio\TwiML\MessagingResponse();
    $twiml->message($reply);
    return response($twiml, 200)->header('Content-Type', 'application/xml');
});


// Routes protégées (auth + email vérifié)
Route::middleware(['auth', 'verified'])->group(function () {

    // Notifications SMS/WhatsApp
    Route::get('/send-sms', [NotificationController::class, 'sendSms']);
    Route::get('/send-whatsapp', [NotificationController::class, 'sendWhatsapp']);

    // Dashboard
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Profil utilisateur
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    // CRUD
    Route::resource('cities', CityController::class);
    Route::resource('agencies', AgencyController::class);
    Route::resource('buses', BusController::class);
    Route::resource('busroutes', TripRouteController::class); // Routes
    Route::resource('trips', TripController::class);
    Route::resource('ticket', TicketController::class);
    Route::resource('users', UserController::class);
});

// Auth routes (login, register, logout...)
require __DIR__ . '/auth.php';
