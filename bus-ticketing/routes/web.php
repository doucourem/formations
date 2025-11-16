<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BusController;
use App\Http\Controllers\AgencyController;
use App\Http\Controllers\RouteController as TripRouteController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\TripController;
use App\Http\Controllers\TicketController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\NotificationController;
/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Route principale pour la page d'accueil
Route::get('/', function () {
    // La méthode Inertia::render() pointe vers le composant React (HomePage.jsx)
    return Inertia::render('HomePage', [
        // Vous pouvez passer ici des données dynamiques si besoin (ex: liste des trajets)
        // 'trajets' => App\Models\Trajet::all(),
    ]);
})->name('home');
// Page d’accueil publique (redirige vers login si non connecté)
/*Route::get('/', function () {
    return redirect()->route('login');
});

*/

// Groupe protégé (authentifié + email vérifié)
Route::middleware(['auth', 'verified'])->group(function () {


Route::get('/send-sms', [NotificationController::class, 'sendSms']);
Route::get('/send-whatsapp', [NotificationController::class, 'sendWhatsapp']);

    // Tableau de bord
    Route::get('/dashboard', function () {
        return Inertia::render('Dashboard');
    })->name('dashboard');

    // Gestion du profil
    Route::prefix('profile')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('profile.update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('profile.destroy');
    });

    // Villes CRUD
    Route::resource('cities', CityController::class);

    // Agences CRUD
    Route::resource('agencies', AgencyController::class);

    // Bus CRUD
    Route::resource('buses', BusController::class);

    // Routes (trajets) CRUD
    //Route::resource('routes', TripRouteController::class);
    Route::resource('busroutes', TripRouteController::class);

    // Voyages CRUD
    Route::resource('trips', TripController::class);

    // Tickets CRUD
    Route::resource('ticket', TicketController::class);

    // Utilisateurs CRUD
    Route::resource('users', UserController::class);
});

// Authentification (login, register, logout, etc.)
require __DIR__ . '/auth.php';
