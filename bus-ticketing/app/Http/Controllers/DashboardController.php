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
        // Ventes jour/semaine/mois (exemple simple : dernier mois)
        $sales = Ticket::selectRaw('DATE(created_at) as date, SUM(price) as revenue, COUNT(*) as tickets')
            ->where('created_at', '>=', now()->subMonth())
            ->groupBy('date')
            ->orderBy('date')
            ->get();

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
        });

        // Top chauffeurs
        $drivers = Driver::with('trips.tickets')->get()->map(fn($d) => [
            'name' => $d->name,
            'revenue' => $d->trips->sum(fn($t) => $t->tickets->sum('price')),
            'tickets' => $d->trips->sum(fn($t) => $t->tickets->count()),
        ])->sortByDesc('revenue')->take(10);

        // Top routes
        $routes = RouteModel::with('trips.tickets')->get()->map(fn($r) => [
            'route' => $r->departureCity->name . ' → ' . $r->arrivalCity->name,
            'revenue' => $r->trips->sum(fn($t) => $t->tickets->sum('price')),
            'tickets_sold' => $r->trips->sum(fn($t) => $t->tickets->count()),
        ])->sortByDesc('revenue')->take(10);

        return response()->json([
            'sales' => $sales,
            'buses' => $buses,
            'top_drivers' => $drivers,
            'top_routes' => $routes,
        ]);
    }
}
