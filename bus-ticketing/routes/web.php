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
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DriverController;

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Twilio\TwiML\MessagingResponse;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\ParcelController;
use App\Http\Controllers\TransferController;
use App\Http\Controllers\SenderController;
use App\Http\Controllers\ReceiverController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\BaggageController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Page d'accueil
Route::get('/', function () {
    return Inertia::render('HomePage');
})->name('home');

// Routes protégées (auth + email vérifié)
Route::middleware(['auth', 'verified'])->group(function () {

    // Notifications SMS/WhatsApp
    Route::get('/send-sms', [NotificationController::class, 'sendSms']);
    Route::get('/send-whatsapp', [NotificationController::class, 'sendWhatsapp']);

    // Dashboard



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
       Route::get('/buses/{bus}/trips', [BusController::class, 'byBus'])
        ->name('trips.byBus');
    Route::resource('busroutes', TripRouteController::class); // Routes
    Route::resource('trips', TripController::class);
    Route::resource('ticket', TicketController::class);
    // routes/web.php
Route::post('/ticket/{ticket}/baggage', [BaggageController::class, 'store'])->name('baggage.store');
// Route pour afficher le formulaire de création d'un bagage
Route::get('/tickets/{ticket}/baggage/create', [BaggageController::class, 'create'])
    ->name('baggage.create');

// Route pour enregistrer le bagage
Route::post('/tickets/{ticket}/baggage', [BaggageController::class, 'store'])
    ->name('baggage.store');


    Route::resource('users', UserController::class);
    Route::resource('parcels',ParcelController::class);
    Route::get('/parcels/{parcel}', [ParcelController::class, 'show'])->name('parcels.show');

    Route::resource('drivers', DriverController::class);
 // Page pour les transferts quotidiens (React/Inertia)
Route::get('/transfers/daily', function () {
    return Inertia::render('Transfers/DailyTransfers');
})->name('transfers.daily');

// API JSON
Route::get('/transfers/daily/data', [TransferController::class, 'daily'])
    ->name('transfers.daily.data');

// Ensuite seulement la resource
Route::resource('transfers', TransferController::class);





// TransferController.php



    
Route::get('/trips/{trip}/parcels', [ParcelController::class, 'indexByTrip'])
     ->name('parcels.byTrip');

  Route::post('/payment/process', [PaymentController::class, 'process'])
    ->name('payment.process');



// Enregistrement expéditeur
Route::post('/senders', [SenderController::class, 'store'])->name('senders.store');

// Enregistrement destinataire
Route::post('/receivers', [ReceiverController::class, 'store'])->name('receivers.store');

Route::post('drivers/{driver}/documents', [DriverController::class, 'uploadDocument']);
Route::post('drivers/{driver}/assign', [DriverController::class, 'assignBusOrTrip']);
Route::get('drivers/{driver}/show', [DriverController::class, 'show']);
Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
Route::get('/dashboard/data', [DashboardController::class, 'data']);
Route::get('/abonnements', [DashboardController::class, 'abonnements']);
});


// Auth routes (login, register, logout...)
require __DIR__ . '/auth.php';
