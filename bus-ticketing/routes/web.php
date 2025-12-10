<?php

use App\Http\Controllers\{
    ProfileController,
    BusController,
    AgencyController,
    RouteController as TripRouteController,
    UserController,
    CityController,
    TripController,
    TicketController,
    NotificationController,
    DashboardController,
    DriverController,
    DriverDocumentController,
    ParcelController,
    TransferController,
    SenderController,
    ReceiverController,
    PaymentController,
    BaggageController,
    TripAssignmentController,
    TripExpenseController,
    BusMaintenanceController
};

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('HomePage');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/data', [DashboardController::class, 'data']);
    Route::get('/abonnements', [DashboardController::class, 'abonnements']);

    // Notifications
    Route::get('/send-sms', [NotificationController::class, 'sendSms']);
    Route::get('/send-whatsapp', [NotificationController::class, 'sendWhatsapp']);

    // Profil
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // Daily Transfers Inertia
    Route::get('/transfers/daily', fn() => Inertia::render('Transfers/DailyTransfers'))->name('transfers.daily');
    Route::get('/transfers/daily/data', [TransferController::class, 'daily'])->name('transfers.daily.data');

    // CRUD standard
    Route::resources([
        'cities' => CityController::class,
        'agencies' => AgencyController::class,
        'buses' => BusController::class,
        'busroutes' => TripRouteController::class,
        'trips' => TripController::class,
        'ticket' => TicketController::class,
        'users' => UserController::class,
        'parcels' => ParcelController::class,
        'drivers' => DriverController::class,
        'transfers' => TransferController::class,
        'trip-expenses' => TripExpenseController::class,
    ]);

    Route::get('buses/{bus}/maintenance', [BusMaintenanceController::class, 'index'])->name('bus.maintenance.index');
    Route::post('maintenance/store', [BusMaintenanceController::class, 'store'])->name('bus.maintenance.store');

    // Buses -> Trips
    Route::get('/buses/{bus}/trips', [BusController::class, 'byBus'])->name('trips.byBus');

    // Tickets -> Baggage
    Route::prefix('tickets/{ticket}')->name('baggage.')->group(function () {
        Route::get('baggage/create', [BaggageController::class, 'create'])->name('create');
        Route::post('baggage', [BaggageController::class, 'store'])->name('store');
    });
    Route::get('/tickets/daily-summary', [TicketController::class, 'dailySummary'])->name('tickets.daily-summary');

    // Parcels by Trip
    Route::get('/trips/{trip}/parcels', [ParcelController::class, 'indexByTrip'])->name('parcels.byTrip');

    // Payments
    Route::post('/payment/process', [PaymentController::class, 'process'])->name('payment.process');

    // Sender & Receiver
    Route::post('/senders', [SenderController::class, 'store'])->name('senders.store');
    Route::post('/receivers', [ReceiverController::class, 'store'])->name('receivers.store');

    // Driver → Documents
    Route::prefix('drivers/{driver}')->name('driver_documents.')->group(function () {
        Route::get('documents', [DriverDocumentController::class, 'index'])->name('index');
        Route::post('documents', [DriverDocumentController::class, 'store'])->name('store');
        Route::delete('documents/{document}', [DriverDocumentController::class, 'destroy'])->name('destroy');
        Route::post('assign', [DriverController::class, 'assignBusOrTrip'])->name('assign');
    });

    // Driver → Trips
    Route::prefix('drivers/{driver}')->name('driver_trips.')->group(function () {
        Route::get('trips/create', [TripAssignmentController::class, 'create'])->name('create');
        Route::post('trips', [TripAssignmentController::class, 'store'])->name('store');
    });

    // Trip assign driver
    Route::get('/trips/{trip}/assign-driver', [TripAssignmentController::class, 'view'])->name('trips.assign-driver.view');
    Route::post('/trips/{trip}/assign-driver', [TripAssignmentController::class, 'store'])->name('trips.assign-driver.store');
});

require __DIR__ . '/auth.php';
