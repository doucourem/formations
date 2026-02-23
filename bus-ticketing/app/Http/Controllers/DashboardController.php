<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\Bus;
use App\Models\Driver;
use App\Models\Parcel;
use App\Models\BusMaintenance as Maintenance;
use App\Models\baggages as Baggage;
use App\Models\Route as RouteModel;
use App\Models\Garage;
use App\Models\TripExpense;

use Illuminate\Support\Facades\DB;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;
class DashboardController extends Controller
{
    public function index()
    {


     $user = auth()->user();
    abort_if(!$user, 403);
    if($user->role === 'etat'){
        return Inertia::render('Dashboard/DashboardState'); // Vue React principale
    }
    else{
return Inertia::render('Dashboard/Index'); // Vue React principale
    }


    }


    public function etatindex()
    {
        return Inertia::render('Dashboard/DashboardState'); // Vue React principale
    }

private function parcelByRoute()
{
    return Parcel::join('trips', 'parcels.trip_id', '=', 'trips.id')
        ->join('routes', 'trips.route_id', '=', 'routes.id')
        ->join('cities as dep', 'routes.departure_city_id', '=', 'dep.id')
        ->join('cities as arr', 'routes.arrival_city_id', '=', 'arr.id')
        ->select(
            'routes.id',
            DB::raw('CONCAT(dep.name, " → ", arr.name) as route_name'),
            DB::raw('COUNT(parcels.id) as parcels_count'),
            DB::raw('SUM(parcels.price) as total_amount')
        )
        ->groupBy('routes.id', 'dep.name', 'arr.name')
        ->orderByDesc('total_amount')
        ->take(5)
        ->get();
}





public function data()
{
    $user = auth()->user();
    abort_if(!$user, 403);

    // 🔹 Base query tickets filtrée par rôle
    $tickets = Ticket::query();

    switch ($user->role) {

        case 'agent':
            $tickets->where('user_id', $user->id);
            break;

        case 'chauffeur':
            $tickets->whereHas('trip', fn($q) => $q->where('driver_id', $user->id));
            break;

        case 'manageragence':
            $tickets->where('agency_id', $user->agency_id);
            break;

        case 'garage':
            return response()->json([
                'maintenances' => Maintenance::with('bus')->get()->map(fn($m) => [
                    'bus' => $m->bus->registration_number ?? '-',
                    'date' => $m->date,
                    'type' => $m->type,
                    'cost' => $m->cost,
                ])
            ]);

        case 'etat':
        case 'manager':
        case 'admin':
        case 'super_admin':
        case 'logistique':
            // accès global
            break;

        default:
            abort(403);
    }

    // 🔹 Ventes journalières (corrigé SQL strict)
    $sales = $tickets->clone()
        ->selectRaw('DATE(created_at) as date, SUM(price) as revenue, COUNT(*) as tickets')
        ->where('created_at', '>=', now()->subMonth())
        ->groupBy(DB::raw('DATE(created_at)'))
        ->orderBy(DB::raw('DATE(created_at)'))
        ->get();

    // 🔹 KPI
    $totalRevenue = $tickets->clone()->sum('price');
    $totalTickets = $tickets->clone()->count();
    $totalBuses = Bus::count();

    // 🔹 Bus stats
    $buses = Bus::with('trips.tickets')->get()->map(function ($bus) {
        $sold = $bus->trips->sum(fn($t) => $t->tickets->count());
        $capacityTotal = ($bus->capacity ?? 0) * $bus->trips->count();
        return [
            'bus' => $bus->registration_number,
            'fill_rate' => $capacityTotal ? round(($sold/$capacityTotal)*100,2) : 0,
            'tickets_sold' => $sold,
            'capacity' => $bus->capacity,
        ];
    });

    $averageFillRate = round($buses->avg('fill_rate'),2);

    $kpis = [
        'revenue' => $totalRevenue,
        'parcels' => $totalTickets,
        'buses' => $totalBuses,
        'fill_rate' => $averageFillRate,
    ];

    // 🔹 Top chauffeurs
    $drivers = Driver::with('trips.tickets')->get()
        ->map(fn($d) => [
            'name' => trim(($d->first_name ?? '').' '.($d->last_name ?? '')),
            'revenue' => $d->trips->sum(fn($t) => $t->tickets->sum('price')),
            'tickets' => $d->trips->sum(fn($t) => $t->tickets->count()),
        ])
        ->sortByDesc('revenue')
        ->take(10)
        ->values();

    // 🔹 Top routes
    $routes = RouteModel::with('trips.tickets','departureCity','arrivalCity')
        ->get()
        ->map(fn($r) => [
            'route' => ($r->departureCity->name ?? '-') . ' → ' . ($r->arrivalCity->name ?? '-'),
            'revenue' => $r->trips->sum(fn($t) => $t->tickets->sum('price')),
            'tickets_sold' => $r->trips->sum(fn($t) => $t->tickets->count()),
        ])
        ->sortByDesc('revenue')
        ->take(10)
        ->values();

    return response()->json([
        'kpis' => $kpis,
        'sales' => $sales,
        'buses' => $buses,
        'top_drivers' => $drivers,
        'top_routes' => $routes,
        'parcel_routes' => $this->parcelByRoute(),
    ]);
}


// Dans DashboardController.php





public function stateData(Request $request)
{
    // 1. Déterminer la période de filtrage
    $period = $request->query('period', 'month'); // 'month' par défaut

    $startDate = match($period) {
        'today' => now()->startOfDay(),
        'week'  => now()->startOfWeek(),
        'month' => Trip::min('departure_at'),
        default => Trip::min('departure_at') ?? now()->startOfMonth(),
    };

    $endDate = now()->endOfDay();

    // 2. 🎟️ Tickets vendus (Filtrés par période)
    $ticketsQuery = Ticket::whereBetween('created_at', [$startDate, $endDate]);
    $ticketsCount = $ticketsQuery->count();
    $contributionRoute = $ticketsCount * 500;

    // 3. 🚧 Redevances Routières (Péages)
    $fraisPeage = TripExpense::where('type', 'peage')
        ->whereBetween('created_at', [$startDate, $endDate])
        ->sum('amount');

    // 4. 🏢 Partenariats Garages (On peut garder le total ou filtrer selon vos besoins)
    $revenuGarages = Garage::count() * 10000;

    // 5. 📊 Flux d'activité (Groupé par jour sur la période sélectionnée)
    $sales = Ticket::whereBetween('created_at', [$startDate, $endDate])
        ->selectRaw('DATE(created_at) as date')
        ->selectRaw('COUNT(*) as tickets')
        ->selectRaw('SUM(price) as revenue')
        ->groupBy('date')
        ->orderBy('date')
        ->get();

    // 6. 🚀 Performance des Lignes (Filtrées)
    $routes = RouteModel::with(['departureCity', 'arrivalCity', 'trips' => function($query) use ($startDate, $endDate) {
            $query->whereBetween('created_at', [$startDate, $endDate]);
        }, 'trips.tickets'])
        ->get()
        ->map(function($r) {
            $ticketsSold = $r->trips->sum(fn($t) => $t->tickets->count());
            $revenue = $r->trips->sum(fn($t) => $t->tickets->sum('price'));

            return [
                'route' => ($r->departureCity->name ?? '-') . ' → ' . ($r->arrivalCity->name ?? '-'),
                'tickets_sold' => $ticketsSold,
                'revenue' => $revenue,
            ];
        })
        ->filter(fn($r) => $r['tickets_sold'] > 0) // N'affiche que les routes actives sur la période
        ->sortByDesc('revenue')
        ->take(10)
        ->values()
        ->toArray();

    // 7. 🚌 Taux de remplissage des Bus (Optionnel)
    $buses = Bus::with(['trips' => function($q) use ($startDate, $endDate) {
            $q->whereBetween('created_at', [$startDate, $endDate]);
        }])->get()->map(function($bus) {
            return [
                'name' => $bus->registration_number,
                'fill_rate' => $bus->trips->avg('fill_rate') ?? 0
            ];
        })->take(5);

    return response()->json([
        // KPIs (Indicateurs clés)
        'tickets_count' => $ticketsCount,
        'contribution_route' => $contributionRoute, // Calculé dynamiquement sur la période
        'frais_peage' => $fraisPeage,
        'revenu_abonnements_garages' => $revenuGarages,

        // Graphiques et Listes
        'top_routes' => $routes,
        'parcel_routes' => Parcel::getStatsByRoute($startDate, $endDate) ?? [],
        'trips' => $sales,
        'buses' => $buses,
        'top_drivers' => [],
    ]);
}





    public function abonnements()
    {
        $abonnements = [
            [
                'plan' => "Standard",
                'tarif' => "10 000 FCFA / mois",
                'description' => "Gestion de base des trajets, billets et chauffeurs. Tableau de bord simple.",
                'objectifs' => [
                    "Suivi des ventes de billets",
                    "Gestion des chauffeurs et trajets",
                    "Tableau de bord simple et intuitif"
                ]
            ],
            [
                'plan' => "Pro",
                'tarif' => "25 000 FCFA / mois",
                'description' => "Toutes les fonctionnalités Standard + planification avancée et statistiques.",
                'objectifs' => [
                    "Planification des trajets et bus",
                    "Statistiques avancées sur les ventes et trajets",
                    "Alertes pour documents expirants"
                ]
            ],
            [
                'plan' => "Enterprise",
                'tarif' => "50 000 FCFA / mois",
                'description' => "Toutes les fonctionnalités Pro + Dashboard premium, exports et support prioritaire.",
                'objectifs' => [
                    "Dashboard complet avec calendrier",
                    "Exports PDF/Excel des plannings et statistiques",
                    "Support prioritaire et assistance dédiée"
                ]
            ],
        ];

        return Inertia::render('Dashboard/Abonnements', compact('abonnements'));
    }






public function exportConsolidated()
{
    $spreadsheet = new Spreadsheet();

    // ---------------------------
    // Onglet Ventes
    // ---------------------------
    $spreadsheet->setActiveSheetIndex(0);
    $sheet = $spreadsheet->getActiveSheet();
    $sheet->setTitle('Ventes');
    $sheet->fromArray(
        array_merge([['Date', 'Revenue', 'Tickets']], $this->getSalesData())
    );

    // ---------------------------
    // Onglet Trajets
    // ---------------------------
    $tripsSheet = $spreadsheet->createSheet();
    $tripsSheet->setTitle('Trajets');
    $tripsSheet->fromArray(
        array_merge(
            [['ID','Route','Bus','Départ','Arrivée','Prix','Places dispo']],
            $this->getTripsData()
        )
    );

    // ---------------------------
    // Onglet Bagages
    // ---------------------------
    $baggagesSheet = $spreadsheet->createSheet();
    $baggagesSheet->setTitle('Bagages');
    $baggagesSheet->fromArray(
        array_merge(
            [['Ticket','Poids (kg)','Prix FCFA']],
            $this->getBaggagesData()
        )
    );

    // ---------------------------
    // Onglet Colis
    // ---------------------------
    $parcelsSheet = $spreadsheet->createSheet();
    $parcelsSheet->setTitle('Colis');
    $parcelsSheet->fromArray(
        array_merge(
            [['Route','Nombre de colis','Revenus']],
            $this->getParcelData()
        )
    );

    // ---------------------------
    // Onglet Maintenance
    // ---------------------------
    $maintenanceSheet = $spreadsheet->createSheet();
    $maintenanceSheet->setTitle('Maintenance');
    $maintenanceSheet->fromArray(
        array_merge(
            [['Bus','Date maintenance','Type','Coût']],
            $this->getMaintenanceData()
        )
    );

    // Assurer que le premier onglet s'affiche par défaut
    $spreadsheet->setActiveSheetIndex(0);

    // ---------------------------
    // Export Excel
    // ---------------------------
    $writer = new Xlsx($spreadsheet);
    $fileName = 'rapport_transport.xlsx';

    return response()->stream(function() use ($writer) {
        $writer->save('php://output');
    }, 200, [
        'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition' => 'attachment; filename="'.$fileName.'"',
    ]);
}

// ---------------------------
// Fonctions pour récupérer les données
// ---------------------------

// Ventes
protected function getSalesData()
{
    $sales = Ticket::selectRaw('DATE(created_at) as date, SUM(price) as revenue, COUNT(*) as tickets')
        ->where('created_at', '>=', now()->subMonth())
        ->groupBy('date')
        ->orderBy('date')
        ->get();

    return $sales->map(fn($s) => [
        $s->date,
        $s->revenue,
        $s->tickets,
    ])->toArray() ?: [];
}

// Trajets
protected function getTripsData()
{
    $trips = Trip::with('route.departureCity', 'route.arrivalCity', 'bus')->get();

    return $trips->map(fn($t) => [
        $t->id,
        ($t->route ? ($t->route->departureCity->name ?? '-') . ' → ' . ($t->route->arrivalCity->name ?? '-') : '-'),
        $t->bus->model ?? '-',
        $t->departure_at ? Carbon::parse($t->departure_at)->format('Y-m-d H:i') : '-',
        $t->arrival_at ? Carbon::parse($t->arrival_at)->format('Y-m-d H:i') : '-',
        $t->route->price ?? 0,
        $t->places_dispo ?? 0,
    ])->toArray() ?: [];
}

// Bagages
protected function getBaggagesData()
{
    $baggages = Baggage::with('ticket')->get();

    return $baggages->map(fn($b) => [
        $b->ticket->id ?? '-',
        $b->weight ?? 0,
        $b->price ?? 0,
    ])->toArray() ?: [];
}

// Colis
protected function getParcelData()
{
    $parcels = Parcel::with('trip.route.departureCity', 'trip.route.arrivalCity')->get();

    return $parcels->map(fn($p) => [
        ($p->trip && $p->trip->route)
            ? ($p->trip->route->departureCity->name ?? '-') . ' → ' . ($p->trip->route->arrivalCity->name ?? '-')
            : '-',
        $p->quantity ?? 0,
        $p->revenue ?? 0,
    ])->toArray() ?: [];
}

// Maintenance
protected function getMaintenanceData()
{
    $maintenances = Maintenance::with('bus')->get();

    return $maintenances->map(fn($m) => [
        $m->bus->registration_number ?? '-',
        $m->date ? Carbon::parse($m->date)->format('Y-m-d') : '-',
        $m->type ?? '-',
        $m->cost ?? 0,
    ])->toArray() ?: [];
}



}
