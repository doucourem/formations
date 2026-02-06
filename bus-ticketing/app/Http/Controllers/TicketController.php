<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use App\Models\Route as TripRoute;
class TicketController extends Controller
{
    /**
     * 🧾 Liste des tickets
     */
public function index(Request $request)
{
    $user = auth()->user();
    abort_if(!$user, 403);

    $userCompanyId = $user->agency?->company_id; // compagnie de l'utilisateur

    // Récupération des routes pour le select
    $routes = TripRoute::with(['departureCity:id,name', 'arrivalCity:id,name'])
        ->orderByDesc('id')
        ->get()
        ->map(fn($route) => [
            'id' => $route->id,
            'departureCity' => $route->departureCity->name ?? '-',
            'arrivalCity' => $route->arrivalCity->name ?? '-',
        ]);

    // 🔍 Filtres
    $search      = $request->string('search')->trim()->value();
    $status      = $request->string('status')->trim()->value();
    $routeSearch = $request->string('route')->trim()->value();
    $dateFrom    = $request->date('date_from');
    $dateTo      = $request->date('date_to');

    $tickets = Ticket::query()
        ->with([
            'trip.route.departureCity:id,name',
            'trip.route.arrivalCity:id,name',
            'trip.bus:company_id,id,registration_number,model,capacity',
            'baggages:id,ticket_id,price,weight',
            'user:id,agency_id',
        ])
        ->when($search, fn($q) => $q->where('client_name', 'like', "%{$search}%"))
        ->when($status, fn($q) => $q->where('status', $status))
        ->when($routeSearch, fn($q) => $q->whereHas('trip.route', fn($q) =>
            $q->where('id', $routeSearch)
        ))
        ->when($dateFrom, fn($q) => $q->whereHas('trip', fn($q) => $q->whereDate('departure_time', '>=', $dateFrom)))
        ->when($dateTo, fn($q) => $q->whereHas('trip', fn($q) => $q->whereDate('departure_time', '<=', $dateTo)))
        ->when(true, function($q) use ($user, $userCompanyId) {
            match ($user->role) {
                'admin', 'manager','super_admin' => null,
                'agent' => $q->where('user_id', $user->id),
                'manageragence' => $q->whereHas('user', fn($u) => $u->where('agency_id', $user->agency_id)),
                default => $q->whereRaw('1 = 0'),
            };

            // 🔹 Limiter aux tickets dont le bus appartient à la même compagnie que l'utilisateur
            if ($userCompanyId) {
                $q->whereHas('trip.bus', fn($b) => $b->where('company_id', $userCompanyId));
            }
        })
        ->orderByDesc('id')
        ->paginate(10)
        ->withQueryString();

    // 🔄 Transformation pour le front
    $tickets->through(fn($ticket) => [
        'id' => $ticket->id,
        'client_name' => $ticket->client_name,
        'status' => $ticket->status,
        'price' => $ticket->price,
        'route_id' => $ticket->trip?->route->id,
        'route_text' => $ticket->trip?->route
            ? ($ticket->trip->route->departureCity->name ?? '-') . ' → ' . ($ticket->trip->route->arrivalCity->name ?? '-')
            : '-',
        'baggages' => $ticket->baggages->map(fn($b) => [
            'id' => $b->id,
            'description' => $b->price,
            'weight' => $b->weight,
        ]),
    ]);

    return Inertia::render('Tickets/Index', [
        'tickets' => $tickets,
        'filters' => [
            'search' => $search,
            'status' => $status,
            'route' => $routeSearch,
            'date_from' => $dateFrom,
            'date_to' => $dateTo,
        ],
        'userRole' => $user->role,
        'routes' => $routes,
    ]);
}









public function dailySummary(Request $request)
{
    // 🔹 Base query
    $ticketsQuery = Ticket::query();

    // 🔹 Filtrage par dates si fourni
    if ($request->filled('from') && $request->filled('to')) {
        $from = Carbon::parse($request->from)->startOfDay();
        $to = Carbon::parse($request->to)->endOfDay();
        $ticketsQuery->whereBetween('created_at', [$from, $to]);
    }

    // 🔹 Récupération tickets avec tri DESC
    $tickets = $ticketsQuery
        ->select('id', 'created_at', 'price')
        ->orderBy('created_at', 'asc')
        ->get();

    // 🔹 Retour vers Inertia
    return Inertia::render('Tickets/DailyTicketsSummary', [
        'tickets' => $tickets,
    ]);
}

    /**
     * ➕ Formulaire de création
     */
    public function create()
    {
        $this->authorizeAgent();

        Carbon::setLocale('fr');
        $today = Carbon::now();

        $trips = Trip::with([
            'route.departureCity',
            'route.arrivalCity',
            'route.stops.city',
            'route.stops.toCity',
            'bus',
        ])
            ->whereDate('departure_at', '>=', $today)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'departure_at' => Carbon::parse($t->departure_at)->translatedFormat('l d F Y H:i'),
                'bus' => [
                    'capacity' => $t->bus?->capacity ?? 0,
                    'model' => $t->bus?->model,
                    'registration_number' => $t->bus?->registration_number,
                ],
                'route' => [
                    'departureCity' => $t->route->departureCity ? ['name' => $t->route->departureCity->name] : null,
                    'arrivalCity' => $t->route->arrivalCity ? ['name' => $t->route->arrivalCity->name] : null,
                    'stops' => $t->route->stops->map(fn($s) => [
                        'id' => $s->id,
                        'distance_from_start' => $s->distance_from_start,
                        'price' => $s->partial_price,
                        'order' => $s->order,
                        'city' => $s->city ? ['name' => $s->city->name] : null,
                        'toCity' => $s->toCity ? ['name' => $s->toCity->name] : null,
                    ]),
                ],
            ]);

        return Inertia::render('Tickets/Form', ['trips' => $trips]);
    }

    /**
     * 💾 Enregistrement d’un ticket
     */
    public function store(Request $request)
    {
        $this->authorizeAgent();

        $data = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'start_stop_id' => 'nullable|exists:route_stops,id',
            'end_stop_id' => 'nullable|exists:route_stops,id',
            'client_name' => 'required|string|max:255',
            'client_nina' => 'nullable|string|max:255',
            'seat_number' => 'nullable|string|max:10',
            'status' => 'required|in:reserved,paid,cancelled',
        ]);

        $trip = Trip::with('route.stops', 'tickets')->findOrFail($data['trip_id']);
        $startStop = $trip->route->stops->where('id', $data['start_stop_id'])->first();
        $endStop = $trip->route->stops->where('id', $data['end_stop_id'])->first();

        // Vérification de l’ordre si les deux stops existent
        if ($startStop && $endStop && $startStop->order > $endStop->order) {
            return back()->withErrors(['start_stop_id' => 'Arrêt de départ ou d’arrivée invalide'])->withInput();
        }

        // 🔹 Vérification de la disponibilité du siège
        $seatTaken = false;

        $seatTaken = $trip->tickets->filter(function ($t) use ($trip, $startStop, $endStop, $data) {
            if ($t->seat_number !== $data['seat_number']) return false;

            // Cas 1 : les arrêts existent → vérifier le chevauchement
            if ($startStop && $endStop && $t->start_stop_id && $t->end_stop_id) {
                $tStart = $trip->route->stops->where('id', $t->start_stop_id)->first()?->order;
                $tEnd = $trip->route->stops->where('id', $t->end_stop_id)->first()?->order;

                return $tStart !== null && $tEnd !== null &&
                       !($tEnd < $startStop->order || $tStart > $endStop->order);
            }

            // Cas 2 : un ou deux arrêts sont nulls → trajet complet, conflit direct
            return true;
        })->isNotEmpty();

        if ($seatTaken) {
            return back()->withErrors(['seat_number' => 'Ce siège est déjà réservé sur cet intervalle.'])->withInput();
        }

        // 🔹 Calcul du prix
        if ($startStop && $endStop) {
            $data['price'] = $trip->route->stops
                ->where('order', '>=', $startStop->order)
                ->where('order', '<=', $endStop->order)
                ->sum('partial_price');
        } else {
            $data['price'] = $trip->route->price ?? 0;
        }

        $data['user_id'] = Auth::id();

        Ticket::create($data);

        return redirect()->route('ticket.index')->with('success', 'Ticket créé avec succès ✅');
    }


    public function edit(Ticket $ticket)
    {
        $this->authorizeAgent();

        $today = Carbon::now();
        $trips = Trip::with(['route.departureCity', 'route.arrivalCity', 'route.stops.city', 'route.stops.toCity'])
            ->whereDate('departure_at', '>=', $today)
            ->get()
            ->map(fn($t) => [
                'id' => $t->id,
                'departure_at' => Carbon::parse($t->departure_at)->translatedFormat('l d F Y H:i'),
                'bus' => [
                    'capacity' => $t->bus?->capacity ?? 0,
                    'model' => $t->bus?->model,
                    'registration_number' => $t->bus?->registration_number,
                ],
                'route' => [
                    'departureCity' => $t->route->departureCity ? ['name' => $t->route->departureCity->name] : null,
                    'arrivalCity' => $t->route->arrivalCity ? ['name' => $t->route->arrivalCity->name] : null,
                    'stops' => $t->route->stops->map(fn($s) => [
                        'id' => $s->id,
                        'distance_from_start' => $s->distance_from_start,
                        'price' => $s->partial_price,
                        'order' => $s->order,
                        'city' => $s->city ? ['name' => $s->city->name] : null,
                        'toCity' => $s->toCity ? ['name' => $s->toCity->name] : null,
                    ]),
                ],
            ]);

        return Inertia::render('Tickets/Form', [
            'ticket' => $ticket,
            'trips' => $trips,
        ]);
    }

    /**
     * ✏️ Modification du ticket
     */
    public function update(Request $request, Ticket $ticket)
    {
        $this->authorizeAgent();

        $data = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'start_stop_id' => 'nullable|exists:route_stops,id',
            'end_stop_id' => 'nullable|exists:route_stops,id',
            'client_name' => 'required|string|max:255',
            'client_nina' => 'nullable|string|max:255',
            'seat_number' => 'nullable|string|max:10',
            'status' => 'required|in:reserved,paid,cancelled',
        ]);

        $trip = Trip::with('route.stops', 'tickets')->findOrFail($data['trip_id']);
        $startStop = $trip->route->stops->where('id', $data['start_stop_id'])->first();
        $endStop = $trip->route->stops->where('id', $data['end_stop_id'])->first();

        if ($startStop && $endStop && $startStop->order > $endStop->order) {
            return back()->withErrors(['start_stop_id' => 'Arrêt de départ ou d’arrivée invalide'])->withInput();
        }

        // Vérification du siège (même logique que store)
        $seatTaken = $trip->tickets->filter(function ($t) use ($trip, $startStop, $endStop, $data, $ticket) {
            if ($t->id === $ticket->id) return false;
            if ($t->seat_number !== $data['seat_number']) return false;

            if ($startStop && $endStop && $t->start_stop_id && $t->end_stop_id) {
                $tStart = $trip->route->stops->where('id', $t->start_stop_id)->first()?->order;
                $tEnd = $trip->route->stops->where('id', $t->end_stop_id)->first()?->order;

                return $tStart !== null && $tEnd !== null &&
                       !($tEnd < $startStop->order || $tStart > $endStop->order);
            }

            return true;
        })->isNotEmpty();

        if ($seatTaken) {
            return back()->withErrors(['seat_number' => 'Ce siège est déjà réservé sur cet intervalle.'])->withInput();
        }

        $data['price'] = ($startStop && $endStop)
            ? $trip->route->stops
                ->where('order', '>=', $startStop->order)
                ->where('order', '<=', $endStop->order)
                ->sum('partial_price')
            : ($trip->route->price ?? 0);

        $data['user_id'] = Auth::id();

        $ticket->update($data);

        return redirect()->route('ticket.index')->with('success', 'Ticket mis à jour avec succès ✅');
    }

    /**
     * 🗑 Suppression
     */
    public function destroy(Ticket $ticket)
    {
        $this->authorizeAgent();
        $ticket->delete();

        return redirect()->route('ticket.index')->with('success', 'Ticket supprimé avec succès ✅');
    }

    /**
     * 🔍 Détail du ticket
     */
 public function show($id)
{
    $ticket = Ticket::with([
        'trip.route.departureCity',
        'trip.route.arrivalCity',
        'trip.bus',
        'startStop.city',
        'startStop.toCity',
        'endStop.city',
        'endStop.toCity',
        'user.agency',
        'baggages', // 🔹 Ajout de la relation bagages
    ])->findOrFail($id);

    return Inertia::render('Tickets/Show', [
        'ticket' => [
            'id' => $ticket->id,
            'seat_number' => $ticket->seat_number,
            'client_name' => $ticket->client_name,
            'status' => $ticket->status,
            'price' => $ticket->price,
            'start_stop' => $ticket->startStop ? [
                'city_name' => $ticket->startStop->city?->name,
                'to_city_name' => $ticket->startStop->toCity?->name,
                'distance_from_start' => $ticket->startStop->distance_from_start,
               
            ] : null,
            'end_stop' => $ticket->endStop ? [
                'city_name' => $ticket->endStop->city?->name,
                'to_city_name' => $ticket->endStop->toCity?->name,
                'distance_from_start' => $ticket->endStop->distance_from_start,
                
            ] : null,
            'user' => $ticket->user ? [
                'name' => $ticket->user->name,
                'email' => $ticket->user->email,
                'agency' => $ticket->user->agency ? ['name' => $ticket->user->agency->name] : null,
            ] : null,
            'trip' => $ticket->trip ? [
                'departure_time' => optional($ticket->trip->departure_at)
                    ? Carbon::parse($ticket->trip->departure_at)->format('d/m/Y H:i')
                    : null,
                'arrival_time' => optional($ticket->trip->arrival_at)
                    ? Carbon::parse($ticket->trip->arrival_at)->format('d/m/Y H:i')
                    : null,
                'bus' => $ticket->trip->bus ? [
                    'plate_number' => $ticket->trip->bus->registration_number,
                ] : null,
                'route' => $ticket->trip->route ? [
                    'departureCity' => $ticket->trip->route->departureCity?->name,
                    'arrivalCity' => $ticket->trip->route->arrivalCity?->name,
                    'price' => $ticket->trip->route->price,
                ] : null,
            ] : null,
            // 🔹 Ajout des bagages dans le tableau retourné
            'baggages' => $ticket->baggages->map(fn($bag) => [
                'id' => $bag->id,
                'weight' => $bag->weight,
                'price' => $bag->price,
            ]),
        ],
    ]);
}


    /**
     * 🔐 Autorisation : seuls les agents et managers d’agence peuvent créer/modifier
     */
    private function authorizeAgent()
    {
        $user = Auth::user();
        if (!in_array($user->role, ['agent', 'manageragence', 'admin'])) {

        }
    }
public function webhookSearch(Request $request)
{
    // Récupération des critères envoyés par le webhook
    $departure = $request->input('departure'); // ville départ
    $arrival = $request->input('arrival');     // ville arrivée
    $date = $request->input('date');           // date souhaitée (YYYY-MM-DD)

    $ticketsQuery = Ticket::with([
        'trip.route.departureCity',
        'trip.route.arrivalCity',
        'trip.bus',
        'startStop.city',
        'endStop.city',
    ])->whereHas('trip.route', function ($q) use ($departure, $arrival) {
        if ($departure) $q->whereHas('departureCity', fn($c) => $c->where('name', 'like', "%$departure%"));
        if ($arrival) $q->whereHas('arrivalCity', fn($c) => $c->where('name', 'like', "%$arrival%"));
    });

    if ($date) {
        $ticketsQuery->whereHas('trip', fn($t) => $t->whereDate('departure_at', $date));
    }

    $tickets = $ticketsQuery->orderBy('trip.departure_at')->get();

    // Format simple pour renvoyer dans un chat WhatsApp
    $response = $tickets->map(fn($ticket) => [
        'ticket_id' => $ticket->id,
        'trip_id' => $ticket->trip_id,
        'departure' => $ticket->trip->route->departureCity->name ?? '-',
        'arrival' => $ticket->trip->route->arrivalCity->name ?? '-',
        'departure_time' => optional($ticket->trip->departure_at)->format('d/m/Y H:i'),
        'arrival_time' => optional($ticket->trip->arrival_at)->format('d/m/Y H:i'),
        'seat_number' => $ticket->seat_number,
        'price' => $ticket->price,
        'status' => $ticket->status,
    ]);

    return response()->json([
        'success' => true,
        'count' => $tickets->count(),
        'tickets' => $response,
    ]);
}

public function export(Request $request)
{
    // 🔍 Récupération des tickets avec relations
    $tickets = Ticket::with(['trip.route.departureCity', 'trip.route.arrivalCity', 'baggages'])
        ->orderBy('id', 'desc')
        ->get();

    // 📊 Création du fichier Excel
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();

    // 📝 En-têtes des colonnes
    $sheet->fromArray([
        ['ID', 'Client', 'Statut du ticket', 'Siège', 'Prix', 'Itinéraire', 'Nombre de bagages', 'Poids total bagages', 'Prix total bagages']
    ], null, 'A1');

    $ligne = 2;
    foreach ($tickets as $ticket) {
        $route = $ticket->trip?->route;

        // 🔹 Traduction du statut en français
        $statutFr = match($ticket->status) {
            'paid' => 'Payé',
            'reserved' => 'Réservé',
            'cancelled' => 'Annulé',
            default => 'Inconnu',
        };

        $sheet->setCellValue('A'.$ligne, $ticket->id)
              ->setCellValue('B'.$ligne, $ticket->client_name)
              ->setCellValue('C'.$ligne, $statutFr) // statut en français
              ->setCellValue('D'.$ligne, $ticket->seat_number)
              ->setCellValue('E'.$ligne, $ticket->price)
              ->setCellValue('F'.$ligne, $route && $route->departureCity && $route->arrivalCity
                  ? $route->departureCity->name.' → '.$route->arrivalCity->name
                  : null)
              ->setCellValue('G'.$ligne, $ticket->baggages->count())
              ->setCellValue('H'.$ligne, $ticket->baggages->sum('weight'))
              ->setCellValue('I'.$ligne, $ticket->baggages->sum('price'));
        $ligne++;
    }

    $writer = new Xlsx($spreadsheet);
    $nomFichier = 'tickets_export_'.now()->format('Ymd_His').'.xlsx';

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


}
