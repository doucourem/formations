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
    Route::resource('parcels',ParcelController::class);
    Route::resource('drivers', DriverController::class);
Route::post('drivers/{driver}/documents', [DriverController::class, 'uploadDocument']);
Route::post('drivers/{driver}/assign', [DriverController::class, 'assignBusOrTrip']);
Route::get('drivers/{driver}/show', [DriverController::class, 'show']);
Route::get('/dashboard', [DashboardController::class, 'index']);
Route::get('/dashboard/data', [DashboardController::class, 'data']);
Route::get('/abonnements', [DashboardController::class, 'abonnements']);
});


// Auth routes (login, register, logout...)
require __DIR__ . '/auth.php';
