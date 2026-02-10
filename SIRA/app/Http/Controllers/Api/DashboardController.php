<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\Bus;
use App\Models\Driver;
use App\Models\Parcel;
use App\Models\BusMaintenance as Maintenance;
use App\Models\Baggage;
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
    // ---------------------------
    // DASHBOARD PRINCIPAL (API)
    // ---------------------------
    public function data()
    {
        // 1️⃣ KPI
        $buses = Bus::with('trips.tickets')->get();

        $totalRevenue = Ticket::sum('price') ?? 0;
        $totalTickets = Ticket::count();
        $totalBuses = Bus::count();

        $averageFillRate = $buses->map(function($bus) {
            $sold = $bus->trips->sum(fn($t) => $t->tickets->count());
            $capacityTotal = $bus->capacity * $bus->trips->count();
            return $capacityTotal ? ($sold / $capacityTotal) * 100 : 0;
        })->avg();

        $kpis = [
            'revenue' => round($totalRevenue, 2),
            'tickets' => $totalTickets,
            'buses' => $totalBuses,
            'fill_rate' => round($averageFillRate, 2),
        ];

        // 2️⃣ Top chauffeurs
        $drivers = Driver::with('trips.tickets')->get()->map(fn($d) => [
            'name' => trim(($d->first_name ?? '') . ' ' . ($d->last_name ?? '')),
            'revenue' => $d->trips->sum(fn($t) => $t->tickets->sum('price') ?? 0),
            'tickets' => $d->trips->sum(fn($t) => $t->tickets->count() ?? 0),
        ])->sortByDesc('revenue')->take(10)->values()->toArray();

        // 3️⃣ Top routes
        $routes = RouteModel::with('trips.tickets', 'departureCity', 'arrivalCity')->get()
            ->map(fn($r) => [
                'route' => ($r->departureCity->name ?? '-') . ' → ' . ($r->arrivalCity->name ?? '-'),
                'revenue' => $r->trips->sum(fn($t) => $t->tickets->sum('price') ?? 0),
                'tickets_sold' => $r->trips->sum(fn($t) => $t->tickets->count() ?? 0),
            ])
            ->sortByDesc('revenue')
            ->take(10)
            ->values()
            ->toArray();

        // 4️⃣ Top colis par route
        $parcel_routes = $this->parcelByRoute();

        // 5️⃣ Statistiques de ventes journalières (dernier mois)
        $sales = Ticket::selectRaw('DATE(created_at) as date, SUM(price) as revenue, COUNT(*) as tickets')
            ->where('created_at', '>=', now()->subMonth())
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return response()->json([
            'kpis' => $kpis,
            'top_drivers' => $drivers,
            'top_routes' => $routes,
            'parcel_routes' => $parcel_routes,
            'sales' => $sales,
            'buses' => $buses->map(fn($bus) => [
                'name' => $bus->registration_number,
                'capacity' => $bus->capacity,
                'tickets_sold' => $bus->trips->sum(fn($t) => $t->tickets->count()),
            ]),
        ]);
    }

    // ---------------------------
    // DASHBOARD ETAT (Filtrage par période)
    // ---------------------------
    public function stateData(Request $request)
    {
        $period = $request->query('period', 'month');

        $startDate = match($period) {
            'today' => now()->startOfDay(),
            'week'  => now()->startOfWeek(),
            'month' => Trip::min('departure_at') ?? now()->startOfMonth(),
            default => Trip::min('departure_at') ?? now()->startOfMonth(),
        };
        $endDate = now()->endOfDay();

        // Tickets vendus
        $ticketsQuery = Ticket::whereBetween('created_at', [$startDate, $endDate]);
        $ticketsCount = $ticketsQuery->count();
        $contributionRoute = $ticketsCount * 500;

        // Péages
        $fraisPeage = TripExpense::where('type', 'peage')
            ->whereBetween('created_at', [$startDate, $endDate])
            ->sum('amount');

        // Abonnements garages
        $revenuGarages = Garage::count() * 10000;

        // Flux d'activité
        $sales = $ticketsQuery->selectRaw('DATE(created_at) as date')
            ->selectRaw('COUNT(*) as tickets')
            ->selectRaw('SUM(price) as revenue')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Performance des lignes
        $routes = RouteModel::with(['departureCity','arrivalCity','trips' => function($q) use ($startDate,$endDate){
            $q->whereBetween('created_at', [$startDate,$endDate])->with('tickets');
        }])->get()->map(fn($r) => [
            'route' => ($r->departureCity->name ?? '-') . ' → ' . ($r->arrivalCity->name ?? '-'),
            'tickets_sold' => $r->trips->sum(fn($t) => $t->tickets->count()),
            'revenue' => $r->trips->sum(fn($t) => $t->tickets->sum('price')),
        ])->filter(fn($r) => $r['tickets_sold'] > 0)
          ->sortByDesc('revenue')
          ->take(10)
          ->values()
          ->toArray();

        // Buses
        $buses = Bus::with(['trips' => fn($q) => $q->whereBetween('created_at', [$startDate,$endDate])->with('tickets')])
            ->get()->map(fn($bus) => [
                'name' => $bus->registration_number,
                'fill_rate' => $bus->trips->count() ? round(
                    $bus->trips->sum(fn($t) => $t->tickets->count()) / ($bus->capacity * $bus->trips->count()) * 100, 2
                ) : 0
            ]);

        return response()->json([
            'tickets_count' => $ticketsCount,
            'contribution_route' => $contributionRoute,
            'frais_peage' => $fraisPeage,
            'revenu_abonnements_garages' => $revenuGarages,
            'top_routes' => $routes,
            'parcel_routes' => Parcel::getStatsByRoute($startDate,$endDate) ?? [],
            'trips' => $sales,
            'buses' => $buses,
            'top_drivers' => [], // optionnel
        ]);
    }

    // ---------------------------
    // ABONNEMENTS API
    // ---------------------------
    public function abonnementsAPI()
    {
        $abonnements = [
            [
                'plan' => "Standard",
                'tarif' => "10 000 FCFA / mois",
                'description' => "Gestion de base des trajets, billets et chauffeurs.",
                'objectifs' => ["Suivi des ventes", "Gestion des chauffeurs", "Tableau de bord simple"]
            ],
            [
                'plan' => "Pro",
                'tarif' => "25 000 FCFA / mois",
                'description' => "Toutes les fonctionnalités Standard + planification avancée et statistiques.",
                'objectifs' => ["Planification des trajets", "Statistiques avancées", "Alertes documents"]
            ],
            [
                'plan' => "Enterprise",
                'tarif' => "50 000 FCFA / mois",
                'description' => "Toutes les fonctionnalités Pro + Dashboard premium, exports et support prioritaire.",
                'objectifs' => ["Dashboard complet", "Exports PDF/Excel", "Support prioritaire"]
            ],
        ];

        return response()->json($abonnements);
    }

    // ---------------------------
    // EXPORT EXCEL
    // ---------------------------
    public function exportConsolidated()
    {
        $spreadsheet = new Spreadsheet();

        // Onglet Ventes
        $sheet = $spreadsheet->setActiveSheetIndex(0);
        $sheet->setTitle('Ventes');
        $sheet->fromArray(array_merge([['Date','Revenue','Tickets']], $this->getSalesData()));

        // Onglet Trajets
        $tripsSheet = $spreadsheet->createSheet();
        $tripsSheet->setTitle('Trajets');
        $tripsSheet->fromArray(array_merge([['ID','Route','Bus','Départ','Arrivée','Prix','Places dispo']], $this->getTripsData()));

        // Onglet Bagages
        $baggagesSheet = $spreadsheet->createSheet();
        $baggagesSheet->setTitle('Bagages');
        $baggagesSheet->fromArray(array_merge([['Ticket','Poids (kg)','Prix FCFA']], $this->getBaggagesData()));

        // Onglet Colis
        $parcelsSheet = $spreadsheet->createSheet();
        $parcelsSheet->setTitle('Colis');
        $parcelsSheet->fromArray(array_merge([['Route','Nombre de colis','Revenus']], $this->getParcelData()));

        // Onglet Maintenance
        $maintenanceSheet = $spreadsheet->createSheet();
        $maintenanceSheet->setTitle('Maintenance');
        $maintenanceSheet->fromArray(array_merge([['Bus','Date maintenance','Type','Coût']], $this->getMaintenanceData()));

        $spreadsheet->setActiveSheetIndex(0);

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
    // MÉTHODES PRIVÉES
    // ---------------------------
    private function parcelByRoute()
    {
        return Parcel::join('trips','parcels.trip_id','=','trips.id')
            ->join('routes','trips.route_id','=','routes.id')
            ->join('cities as dep','routes.departure_city_id','=','dep.id')
            ->join('cities as arr','routes.arrival_city_id','=','arr.id')
            ->select(
                'routes.id',
                DB::raw('CONCAT(dep.name," → ",arr.name) as route_name'),
                DB::raw('COUNT(parcels.id) as parcels_count'),
                DB::raw('SUM(parcels.price) as total_amount')
            )
            ->groupBy('routes.id','dep.name','arr.name')
            ->orderByDesc('total_amount')
            ->take(5)
            ->get();
    }

    // Données Excel
    protected function getSalesData()
    {
        return Ticket::selectRaw('DATE(created_at) as date, SUM(price) as revenue, COUNT(*) as tickets')
            ->where('created_at','>=',now()->subMonth())
            ->groupBy('date')
            ->orderBy('date')
            ->get()
            ->map(fn($s) => [$s->date, $s->revenue, $s->tickets])
            ->toArray();
    }

    protected function getTripsData()
    {
        return Trip::with('route.departureCity','route.arrivalCity','bus')->get()
            ->map(fn($t) => [
                $t->id,
                $t->route ? ($t->route->departureCity->name ?? '-') . ' → ' . ($t->route->arrivalCity->name ?? '-') : '-',
                $t->bus->model ?? '-',
                $t->departure_at ? Carbon::parse($t->departure_at)->format('Y-m-d H:i') : '-',
                $t->arrival_at ? Carbon::parse($t->arrival_at)->format('Y-m-d H:i') : '-',
                $t->route->price ?? 0,
                $t->places_dispo ?? 0,
            ])->toArray();
    }

    protected function getBaggagesData()
    {
        return Baggage::with('ticket')->get()
            ->map(fn($b) => [$b->ticket->id ?? '-', $b->weight ?? 0, $b->price ?? 0])
            ->toArray();
    }

    protected function getParcelData()
    {
        return Parcel::with('trip.route.departureCity','trip.route.arrivalCity')->get()
            ->map(fn($p) => [
                ($p->trip && $p->trip->route) ? ($p->trip->route->departureCity->name ?? '-') . ' → ' . ($p->trip->route->arrivalCity->name ?? '-') : '-',
                $p->quantity ?? 0,
                $p->revenue ?? 0,
            ])->toArray();
    }

    protected function getMaintenanceData()
    {
        return Maintenance::with('bus')->get()
            ->map(fn($m) => [
                $m->bus->registration_number ?? '-',
                $m->date ? Carbon::parse($m->date)->format('Y-m-d') : '-',
                $m->type ?? '-',
                $m->cost ?? 0,
            ])->toArray();
    }
}
