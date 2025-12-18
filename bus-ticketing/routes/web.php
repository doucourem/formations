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
    BusMaintenanceController,
    GarageController,
    CompanyController,
    DeliveryController
};

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;






Route::get('/', fn() => Inertia::render('HomePage'))->name('home');
Route::get('/garages3', fn() => Inertia::render('HomePageMUIAnimated'))->name('garages3');
Route::get('/garages2', fn() => Inertia::render('HomePageEnhanced'))->name('garages2');

Route::middleware(['auth', 'verified'])->group(function () {

    // Dashboard
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/data', [DashboardController::class, 'data']);
    Route::get('/abonnements', [DashboardController::class, 'abonnements']);
    Route::get('/export-consolidated', [DashboardController::class, 'exportConsolidated'])
    ->name('export.consolidated');

    // Notifications
    Route::get('/send-sms', [NotificationController::class, 'sendSms']);
    Route::get('/send-whatsapp', [NotificationController::class, 'sendWhatsapp']);

    // Profil
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::get('/', [ProfileController::class, 'edit'])->name('edit');
        Route::patch('/', [ProfileController::class, 'update'])->name('update');
        Route::delete('/', [ProfileController::class, 'destroy'])->name('destroy');
    });

    // Daily Transfers
    Route::get('/transfers/daily', fn() => Inertia::render('Transfers/DailyTransfers'))->name('transfers.daily');
    Route::get('/transfers/daily/data', [TransferController::class, 'daily'])->name('transfers.daily.data');

     Route::get('/trips/export', [TripController::class, 'exportTripsSummary'])->name('trips.export');
Route::get('/trips/export-detailed', [TripController::class, 'exportDetailedTrips'])->name('trips.export-detailed');


Route::get('/parcels/export', [ParcelController::class, 'exportSummary'])->name('parcels.export');
Route::get('/parcels/export-detailed', [ParcelController::class, 'exportDetailed'])->name('parcels.export-detailed');

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
        'drivers' => DriverController::class, // <-- Garde cette ligne avant les préfixes driver/{driver}
        'transfers' => TransferController::class,
        'trip-expenses' => TripExpenseController::class,
    ]);
Route::resource('deliveries', DeliveryController::class);
Route::post('deliveries/{delivery}/log', [DeliveryController::class, 'addLog'])->name('deliveries.addLog');

    Route::resource('companies', CompanyController::class);
    Route::resource('garages', GarageController::class);

    // Bus Maintenance
    Route::get('buses/{bus}/maintenance', [BusMaintenanceController::class, 'index'])->name('bus.maintenance.index');
    Route::post('maintenance/store', [BusMaintenanceController::class, 'store'])->name('bus.maintenance.store');
// routes/web.php
Route::put('maintenance/{maintenance}', [BusMaintenanceController::class, 'update'])
    ->name('bus.maintenance.update');

    // Buses -> Trips
    Route::get('/buses/{bus}/trips', [BusController::class, 'byBus'])->name('trips.byBus');

    // Tickets -> Baggage
    Route::prefix('tickets/{ticket}')->name('baggage.')->group(function () {
        Route::get('baggage/create', [BaggageController::class, 'create'])->name('create');
        Route::post('baggage', [BaggageController::class, 'store'])->name('store');
    });
    Route::get('/tickets/daily-summary', [TicketController::class, 'dailySummary'])->name('tickets.daily-summary');

    Route::get('/tickets/export', [TicketController::class, 'export'])
    ->name('ticket.export');
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
