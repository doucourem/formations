<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Trip;
use App\Models\Bus;
use App\Models\Route as TripRoute;
use Illuminate\Support\Facades\Redirect;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
class TripController extends Controller
{
public function index(Request $request)
{
    $perPage = (int) $request->input('per_page', 10);
    $busId = $request->input('bus_id');
    $routeId = $request->input('route_id');
    $user = auth()->user();
    $userCompanyId = $user->agency?->company_id; // récupère la compagnie de l'utilisateur

    // 🔹 Récupération des trips avec relations nécessaires
    $trips = Trip::with([
        'bus:id,model,registration_number,capacity,company_id',
        'expenses',
        'route.departureCity:id,name',
        'route.arrivalCity:id,name',
    ])
    ->withCount('tickets')
    // 🔹 Filtrer par la compagnie du bus
    ->when($userCompanyId, fn($q) => $q->whereHas('bus', fn($b) => $b->where('company_id', $userCompanyId)))
    ->when($busId, fn($q) => $q->where('bus_id', $busId))
    ->when($routeId, fn($q) => $q->where('route_id', $routeId))
    ->orderByDesc('departure_at')
    ->paginate($perPage)
    ->withQueryString();

    // 🔄 Transformation pour le front
    $trips->getCollection()->transform(function ($trip) {
        // URL d'édition
        $trip->edit_url = route('trips.edit', $trip->id);

        // Valeurs sûres pour route et villes
        $trip->route = $trip->route ?? (object)[
            'departureCity' => (object)['name' => '-'],
            'arrivalCity' => (object)['name' => '-'],
            'price' => 0,
        ];

        $trip->route->departureCity = $trip->route->departureCity ?? (object)['name' => '-'];
        $trip->route->arrivalCity = $trip->route->arrivalCity ?? (object)['name' => '-'];

        // Calcul des places disponibles
        $trip->places_dispo = max(($trip->bus->capacity ?? 0) - $trip->tickets_count, 0);

        return $trip;
    });

    // 🔹 Liste des bus pour filtre (uniquement ceux de la compagnie)
    $buses = Bus::when($userCompanyId, fn($q) => $q->where('company_id', $userCompanyId))
        ->select('id', 'model', 'registration_number', 'capacity')
        ->orderBy('model')
        ->get();

    // 🔹 Liste des routes pour filtre
    $routes = TripRoute::with([
        'departureCity:id,name',
        'arrivalCity:id,name'
    ])
    ->orderByDesc('id')
    ->get()
    ->map(fn($route) => [
        'id' => $route->id,
        'departureCity' => $route->departureCity->name ?? '-',
        'arrivalCity' => $route->arrivalCity->name ?? '-',
        'price' => $route->price ?? 0,
    ]);

    return Inertia::render('Trips/Index', [
        'initialTrips' => $trips,
        'initialFilters' => [
            'bus_id' => $busId,
            'route_id' => $routeId,
            'per_page' => $perPage,
        ],
        'buses' => $buses,
        'routes' => $routes,
        'userRole' => $user?->role,
    ]);
}






   public function create()
{
    $user = auth()->user();
    $userCompanyId = $user->agency?->company_id; // compagnie de l'utilisateur

    // 🔹 Routes disponibles (toutes pour l'instant, tu peux filtrer par compagnie si nécessaire)
    $routes = TripRoute::with(['departureCity:id,name', 'arrivalCity:id,name'])
        ->get()
        ->map(fn($route) => [
            'id' => $route->id,
            'departure_city' => $route->departureCity?->name ?? '-',
            'arrival_city' => $route->arrivalCity?->name ?? '-',
        ]);

    // 🔹 Buses disponibles uniquement pour la compagnie de l'utilisateur
    $buses = Bus::when($userCompanyId, fn($q) => $q->where('company_id', $userCompanyId))
        ->select('id', 'registration_number', 'model', 'capacity')
        ->orderBy('model')
        ->get();

    return Inertia::render('Trips/Create', [
        'routes' => $routes,
        'buses' => $buses,
    ]);
}


    public function store(Request $request)
    {
        $validated = $request->validate([
            'route_id' => ['required', 'exists:routes,id'],
            'bus_id' => ['required', 'exists:buses,id'],
            'departure_at' => ['required', 'date', 'after_or_equal:today'],
            'arrival_at' => ['required', 'date', 'after:departure_at'],
        ]);

        try {
            Trip::create($validated);
            return Redirect::route('trips.index')->with('success', 'Voyage créé avec succès.');
        } catch (\Throwable $e) {
            return Redirect::back()
                ->with('error', 'Erreur lors de la création du voyage : ' . $e->getMessage())
                ->withInput();
        }
    }

    public function edit(Trip $trip)
    {
        $routes = TripRoute::with(['departureCity:id,name', 'arrivalCity:id,name'])
            ->get()
            ->map(fn($route) => [
                'id' => $route->id,
                'departureCity' => $route->departureCity?->name ?? '-',
                'arrivalCity' => $route->arrivalCity?->name ?? '-',
            ]);

        $buses = Bus::all();

        $tripData = [
            'id' => $trip->id,
            'route_id' => $trip->route_id,
            'bus_id' => $trip->bus_id,
            'departure_at' => Carbon::parse($trip->departure_at)->format('Y-m-d\TH:i'),
            'arrival_at' => Carbon::parse($trip->arrival_at)->format('Y-m-d\TH:i'),
        ];

        return Inertia::render('Trips/Edit', [
            'trip' => $tripData,
            'routes' => $routes,
            'buses' => $buses,
        ]);
    }

    public function update(Request $request, Trip $trip)
    {
        $validated = $request->validate([
            'route_id' => ['required', 'exists:routes,id'],
            'bus_id' => ['required', 'exists:buses,id'],
            'departure_at' => ['required', 'date', 'after_or_equal:today'],
            'arrival_at' => ['required', 'date', 'after:departure_at'],
        ]);

        try {
            $trip->update($validated);
            return Redirect::route('trips.index')->with('success', 'Voyage mis à jour avec succès.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Erreur : ' . $e->getMessage())->withInput();
        }
    }

    public function destroy(Trip $trip)
    {
        try {
            $trip->delete();
            return Redirect::route('trips.index')->with('success', 'Voyage supprimé avec succès.');
        } catch (\Exception $e) {
            return Redirect::back()->with('error', 'Impossible de supprimer ce voyage.');
        }
    }

public function show($id)
{
    $user = auth()->user();

    $trip = Trip::with([
        'route.departureCity',
        'route.arrivalCity',
        'bus',
        'expenses',
        'tickets.user.agency'
    ])->findOrFail($id);

    /*
    |--------------------------------------------------------------------------
    | 🔐 Filtrage tickets selon rôle
    |--------------------------------------------------------------------------
    */
    $tickets = $trip->tickets ?? collect();

    if (!$user) {
        $tickets = collect();
    } else {
        switch ($user->role) {

            case 'admin':
            case 'manager':
            case 'super_admin':
                break;

            case 'agent':
                $tickets = $tickets->where('user_id', $user->id);
                break;

            case 'manageragence':
                $tickets = $tickets->filter(fn($t) =>
                    $t->user && $t->user->agence_id === $user->agence_id
                );
                break;

            default:
                $tickets = collect();
        }
    }

    // tri siège
    $tickets = $tickets->sortBy(fn($t) => (int)$t->seat_number);

    /*
    |--------------------------------------------------------------------------
    | 💰 Calculs financiers
    |--------------------------------------------------------------------------
    */
    $totalTickets = $tickets->sum('price');
    $totalExpenses = ($trip->expenses ?? collect())->sum('amount');
    $benefit = $totalTickets - $totalExpenses;

    /*
    |--------------------------------------------------------------------------
    | 📦 Format Frontend
    |--------------------------------------------------------------------------
    */
    $tripData = [
        'id' => $trip->id,
        'departure_at' => $trip->departure_at,
        'arrival_at' => $trip->arrival_at,

        'bus' => $trip->bus ? [
            'id' => $trip->bus->id,
            'registration_number' => $trip->bus->registration_number,
            'capacity' => $trip->bus->capacity,
        ] : null,

        'route' => $trip->route ? [
            'id' => $trip->route->id,
            'departureCity' => $trip->route->departureCity?->name ?? '-',
            'arrivalCity' => $trip->route->arrivalCity?->name ?? '-',
            'price' => $trip->route->price ?? 0,
        ] : null,

        /*
        |--------------------------------------------------------------------------
        | 🎫 Tickets
        |--------------------------------------------------------------------------
        */
        'tickets' => $tickets->map(fn($ticket) => [
            'id' => $ticket->id,
            'client_name' => $ticket->client_name,
            'seat_number' => $ticket->seat_number,
            'price' => $ticket->price,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at?->toISOString(),
            'user' => $ticket->user ? [
                'name' => $ticket->user->name,
                'agency' => $ticket->user->agency
                    ? ['name' => $ticket->user->agency->name]
                    : null,
            ] : null,
        ])->values(),

        /*
        |--------------------------------------------------------------------------
        | 💸 Dépenses
        |--------------------------------------------------------------------------
        */
        'expenses' => ($trip->expenses ?? collect())->map(fn($expense) => [
            'id' => $expense->id,
            'type' => $expense->type,
            'amount' => $expense->amount,
            'description' => $expense->description,
            'created_at' => $expense->created_at?->toISOString(),
        ])->values(),

        /*
        |--------------------------------------------------------------------------
        | 📊 Bloc financier
        |--------------------------------------------------------------------------
        */
        'financial' => [
            'total_tickets' => $totalTickets,
            'total_expenses' => $totalExpenses,
            'benefit' => $benefit,
        ],
    ];

    return Inertia::render('Trips/Show', [
        'trip' => $tripData,
    ]);
}






public function exportExcel(Request $request)
{
    $busId = $request->input('bus_id');
    $routeId = $request->input('route_id');

    // 🔍 Récupération des trajets avec relations
    $trips = Trip::with([
        'bus',
        'expenses',
        'route.departureCity',
        'route.arrivalCity',
    ])
    ->withCount('tickets')
    ->when($busId, fn($q) => $q->where('bus_id', $busId))
    ->when($routeId, fn($q) => $q->where('route_id', $routeId))
    ->orderByDesc('departure_at')
    ->get();

    // 📊 Création du fichier Excel
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // 📝 En-têtes
    $sheet->fromArray([
        ['ID', 'Bus', 'Immatriculation', 'Capacité', 'Route', 'Prix de base', 'Nombre tickets', 'Places disponibles', 'Dépenses totales']
    ], null, 'A1');

    $ligne = 2;
    foreach ($trips as $trip) {
        $bus = $trip->bus;
        $route = $trip->route;

        $placesDispo = max(($bus->capacity ?? 0) - $trip->tickets_count, 0);
        $depensesTotales = $trip->expenses->sum('amount');

        $sheet->setCellValue('A'.$ligne, $trip->id)
              ->setCellValue('B'.$ligne, $bus?->model ?? '-')
              ->setCellValue('C'.$ligne, $bus?->registration_number ?? '-')
              ->setCellValue('D'.$ligne, $bus?->capacity ?? 0)
              ->setCellValue('E'.$ligne, ($route?->departureCity?->name ?? '-') . ' → ' . ($route?->arrivalCity?->name ?? '-'))
              ->setCellValue('F'.$ligne, $route?->price ?? 0)
              ->setCellValue('G'.$ligne, $trip->tickets_count)
              ->setCellValue('H'.$ligne, $placesDispo)
              ->setCellValue('I'.$ligne, $depensesTotales);

        $ligne++;
    }

    $writer = new Xlsx($spreadsheet);
    $nomFichier = 'trips_export_' . now()->format('Ymd_His') . '.xlsx';

    // ⚡ Vider le buffer pour éviter la corruption
    ob_end_clean();

    // 📤 Retour du fichier Excel
    return response()->stream(function() use ($writer) {
        $writer->save('php://output');
    }, 200, [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition' => 'attachment; filename="'. $nomFichier .'"',
        'Cache-Control' => 'max-age=0',
    ]);
}

public function exportDetailedTrips(Request $request)
{
    $busId = $request->input('bus_id');
    $routeId = $request->input('route_id');

    // 🔍 Récupération des trajets avec tickets et relations
    $trips = Trip::with([
        'bus',
        'route.departureCity',
        'route.arrivalCity',
        'tickets',
        'expenses'
    ])
    ->when($busId, fn($q) => $q->where('bus_id', $busId))
    ->when($routeId, fn($q) => $q->where('route_id', $routeId))
    ->orderByDesc('departure_at')
    ->get();

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // 📝 En-têtes
    $sheet->fromArray([
        [
            'ID Trajet', 'Date départ', 'Date arrivée', 'Bus', 'Immatriculation', 'Route',
            'Prix du trajet', 'Nom client', 'Siège', 'Statut ticket', 'Prix ticket', 'Dépenses totales'
        ]
    ], null, 'A1');

    $ligne = 2;

    foreach ($trips as $trip) {
        $bus = $trip->bus;
        $route = $trip->route;
        $depensesTotales = $trip->expenses->sum('amount');

        // Si aucun ticket, créer une ligne vide pour le trajet
        if ($trip->tickets->isEmpty()) {
            $sheet->setCellValue('A'.$ligne, $trip->id)
                  ->setCellValue('B'.$ligne, optional($trip->departure_at)->format('d/m/Y H:i'))
                  ->setCellValue('C'.$ligne, optional($trip->arrival_at)->format('d/m/Y H:i'))
                  ->setCellValue('D'.$ligne, $bus?->model ?? '-')
                  ->setCellValue('E'.$ligne, $bus?->registration_number ?? '-')
                  ->setCellValue('F'.$ligne, ($route?->departureCity?->name ?? '-') . ' → ' . ($route?->arrivalCity?->name ?? '-'))
                  ->setCellValue('G'.$ligne, $route?->price ?? 0)
                  ->setCellValue('H'.$ligne, '-')
                  ->setCellValue('I'.$ligne, '-')
                  ->setCellValue('J'.$ligne, '-')
                  ->setCellValue('K'.$ligne, '-')
                  ->setCellValue('L'.$ligne, $depensesTotales);
            $ligne++;
            continue;
        }

        foreach ($trip->tickets as $ticket) {
            // Traduction du statut
            $statutFr = match($ticket->status) {
                'paid' => 'Payé',
                'reserved' => 'Réservé',
                'cancelled' => 'Annulé',
                default => 'Inconnu',
            };

            $sheet->setCellValue('A'.$ligne, $trip->id)
                  ->setCellValue('B'.$ligne, optional($trip->departure_at)->format('d/m/Y H:i'))
                  ->setCellValue('C'.$ligne, optional($trip->arrival_at)->format('d/m/Y H:i'))
                  ->setCellValue('D'.$ligne, $bus?->model ?? '-')
                  ->setCellValue('E'.$ligne, $bus?->registration_number ?? '-')
                  ->setCellValue('F'.$ligne, ($route?->departureCity?->name ?? '-') . ' → ' . ($route?->arrivalCity?->name ?? '-'))
                  ->setCellValue('G'.$ligne, $route?->price ?? 0)
                  ->setCellValue('H'.$ligne, $ticket->client_name)
                  ->setCellValue('I'.$ligne, $ticket->seat_number)
                  ->setCellValue('J'.$ligne, $statutFr)
                  ->setCellValue('K'.$ligne, $ticket->price)
                  ->setCellValue('L'.$ligne, $depensesTotales);

            $ligne++;
        }
    }

    $writer = new Xlsx($spreadsheet);
    $nomFichier = 'trips_detailed_export_' . now()->format('Ymd_His') . '.xlsx';

    ob_end_clean();

    return response()->stream(function() use ($writer) {
        $writer->save('php://output');
    }, 200, [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition' => 'attachment; filename="'. $nomFichier .'"',
        'Cache-Control' => 'max-age=0',
    ]);
}

public function exportTripsSummary(Request $request)
{
    $busId = $request->input('bus_id');
    $routeId = $request->input('route_id');

    // 🔍 Récupération des trajets avec relations
    $trips = Trip::with([
        'bus',
        'route.departureCity',
        'route.arrivalCity',
        'tickets',
        'expenses',
    ])
    ->when($busId, fn($q) => $q->where('bus_id', $busId))
    ->when($routeId, fn($q) => $q->where('route_id', $routeId))
    ->orderByDesc('departure_at')
    ->get();

    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // 📝 En-têtes
    $sheet->fromArray([
        [
            'ID Trajet', 'Date départ', 'Date arrivée', 'Bus', 'Immatriculation', 'Route',
            'Prix de base', 'Tickets vendus', 'Places disponibles', 'Statuts tickets', 'Total tickets', 'Dépenses totales'
        ]
    ], null, 'A1');

    $ligne = 2;

    foreach ($trips as $trip) {
        $bus = $trip->bus;
        $route = $trip->route;
        $tickets = $trip->tickets;
        $depensesTotales = $trip->expenses->sum('amount');

        $placesDispo = max(($bus->capacity ?? 0) - $tickets->count(), 0);

        // Résumé des statuts des tickets
        $statutsSummary = [
            'Payé' => $tickets->where('status', 'paid')->count(),
            'Réservé' => $tickets->where('status', 'reserved')->count(),
            'Annulé' => $tickets->where('status', 'cancelled')->count(),
        ];

        $statutsText = implode(', ', array_map(fn($k,$v) => "$k: $v", array_keys($statutsSummary), $statutsSummary));

        $totalTicketPrice = $tickets->sum('price');

        $sheet->setCellValue('A'.$ligne, $trip->id)
              ->setCellValue('B'.$ligne, optional($trip->departure_at)->format('d/m/Y H:i'))
              ->setCellValue('C'.$ligne, optional($trip->arrival_at)->format('d/m/Y H:i'))
              ->setCellValue('D'.$ligne, $bus?->model ?? '-')
              ->setCellValue('E'.$ligne, $bus?->registration_number ?? '-')
              ->setCellValue('F'.$ligne, ($route?->departureCity?->name ?? '-') . ' → ' . ($route?->arrivalCity?->name ?? '-'))
              ->setCellValue('G'.$ligne, $route?->price ?? 0)
              ->setCellValue('H'.$ligne, $tickets->count())
              ->setCellValue('I'.$ligne, $placesDispo)
              ->setCellValue('J'.$ligne, $statutsText)
              ->setCellValue('K'.$ligne, $totalTicketPrice)
              ->setCellValue('L'.$ligne, $depensesTotales);

        $ligne++;
    }

    $writer = new Xlsx($spreadsheet);
    $nomFichier = 'trips_summary_export_' . now()->format('Ymd_His') . '.xlsx';

    ob_end_clean();

    return response()->stream(function() use ($writer) {
        $writer->save('php://output');
    }, 200, [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition' => 'attachment; filename="'. $nomFichier .'"',
        'Cache-Control' => 'max-age=0',
    ]);
}



}
