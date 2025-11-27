<?php 
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\Bus;
use App\Models\Driver;
use App\Models\Route as RouteModel;

class DashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('Dashboard/Index'); // Vue React principale
    }

    public function data()
{
    // Ventes jour/semaine/mois (dernier mois)
    $sales = Ticket::selectRaw('DATE(created_at) as date, SUM(price) as revenue, COUNT(*) as tickets')
        ->where('created_at', '>=', now()->subMonth())
        ->groupBy('date')
        ->orderBy('date')
        ->get()
        ->toArray(); // <- optionnel, mais OK

    // Taux de remplissage bus
    $buses = Bus::with('trips.tickets')->get()->map(function($bus) {
        $capacity = $bus->capacity ?? 0;
        $sold = $bus->trips->sum(fn($t) => $t->tickets->count());
        return [
            'bus' => $bus->registration_number,
            'fill_rate' => $capacity ? round($sold / $capacity * 100, 2) : 0,
            'tickets_sold' => $sold,
            'capacity' => $capacity,
        ];
    })->values()->toArray(); // <- important

    // Top chauffeurs
    $drivers = Driver::with('trips.tickets')->get()->map(fn($d) => [
        'name' => $d->name,
        'revenue' => $d->trips->sum(fn($t) => $t->tickets->sum('price')),
        'tickets' => $d->trips->sum(fn($t) => $t->tickets->count()),
    ])->sortByDesc('revenue')->take(10)->values()->toArray(); // <- values() + toArray()

    // Top routes
    $routes = RouteModel::with('trips.tickets')->get()->map(fn($r) => [
        'route' => $r->departureCity->name . ' → ' . $r->arrivalCity->name,
        'revenue' => $r->trips->sum(fn($t) => $t->tickets->sum('price')),
        'tickets_sold' => $r->trips->sum(fn($t) => $t->tickets->count()),
    ])->sortByDesc('revenue')->take(10)->values()->toArray(); // <- values() + toArray()

    return response()->json([
        'sales' => $sales,
        'buses' => $buses,
        'top_drivers' => $drivers,
        'top_routes' => $routes,
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


}
