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

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard/Index'); // Vue React principale
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
    // 🔹 Ventes jour/semaine/mois (dernier mois)
    $sales = Ticket::selectRaw('DATE(created_at) as date, SUM(price) as revenue, COUNT(*) as tickets')
        ->where('created_at', '>=', now()->subMonth())
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->toArray();

    // 🔹 Taux de remplissage bus
    $buses = Bus::with('trips.tickets')->get()->map(function ($bus) {
        $capacity = $bus->capacity ?? 0;
        $sold = $bus->trips->sum(fn($t) => optional($t->tickets)->count() ?? 0);
        return [
            'bus' => $bus->registration_number ?? '-',
            'fill_rate' => $capacity ? round($sold / $capacity * 100, 2) : 0,
            'tickets_sold' => $sold,
            'capacity' => $capacity,
        ];
    })->values()->toArray();

    // 🔹 KPI
    $totalRevenue = Ticket::sum('price') ?? 0;
    $totalParcels = Ticket::count();
    $totalBuses = Bus::count();
    $averageFillRate = $buses ? round(collect($buses)->avg('fill_rate'), 2) : 0;

    $kpis = [
        'revenue' => $totalRevenue,
        'parcels' => $totalParcels,
        'buses' => $totalBuses,
        'fill_rate' => $averageFillRate,
    ];

    // 🔹 Top chauffeurs
    $drivers = Driver::with('trips.tickets')->get()->map(fn($d) => [
        'first_name' => trim(($d->first_name ?? '').' '.($d->last_name ?? '')),
        'revenue' => $d->trips->sum(fn($t) => optional($t->tickets)->sum('price') ?? 0),
        'tickets' => $d->trips->sum(fn($t) => optional($t->tickets)->count() ?? 0),
    ])->sortByDesc('revenue')->take(10)->values()->toArray();

    // 🔹 Top routes
    $routes = RouteModel::with('trips.tickets', 'departureCity', 'arrivalCity')->get()->map(fn($r) => [
        'route' => (optional($r->departureCity)->name ?? '-') . ' → ' . (optional($r->arrivalCity)->name ?? '-'),
        'revenue' => $r->trips->sum(fn($t) => optional($t->tickets)->sum('price') ?? 0),
        'tickets_sold' => $r->trips->sum(fn($t) => optional($t->tickets)->count() ?? 0),
    ])->sortByDesc('revenue')->take(10)->values()->toArray();

    // 🔹 Parcels par route
    $parcel_routes = $this->parcelByRoute() ?? [];

    return response()->json([
        'sales' => $sales,
        'buses' => $buses,
        'top_drivers' => $drivers,
        'top_routes' => $routes,
        'parcel_routes' => $parcel_routes,
        'kpis' => $kpis, // <-- ajouté !
    ]);
}


// Dans DashboardController.php

public function stateData() {
    $ticketsCount = Ticket::count();
    
    // Calcul de l'abonnement des garages (ex: 10 000 par mois par garage actif)
    $revenuGarages = Garage::where('is_active', true)->count() * 10000;

    return response()->json([
        'tickets_count'      => $ticketsCount,
        'contribution_route' => $ticketsCount * 500, // Les 500 FCFA promis
        'frais_peage'        => TripExpense::where('type', 'peage')->sum('amount'),
        'frais_garage'       => Maintenance::sum('cost'),
        'revenu_abonnements_garages' => $revenuGarages,
        
        // Données pour les graphiques
        'top_drivers' => 0,
        'top_routes'  => RouteModel::getStats(), // Imaginons une méthode de stats
        'parcel_routes' => Parcel::getStatsByRoute(),
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
