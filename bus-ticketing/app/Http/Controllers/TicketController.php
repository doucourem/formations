<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class TicketController extends Controller
{
    /**
     * 🧾 Liste des tickets
     */
public function index(Request $request)
{
    // 🔍 Récupération des filtres envoyés par Inertia
    $search = $request->input('search');
    $status = $request->input('status');

    // 🔧 Query de base avec relations
    $query = Ticket::with(['trip.route.departureCity', 'trip.route.arrivalCity', 'baggages'])
        ->orderBy('id', 'desc');

    // 🔍 Filtre recherche
    if (!empty($search)) {
        $query->where('client_name', 'LIKE', '%' . $search . '%');
    }

    // 🎯 Filtre statut
    if (!empty($status)) {
        $query->where('status', $status);
    }

    // 📄 Pagination dynamique (10 par page)
    $tickets = $query->paginate(10)->withQueryString();

    // 🔄 Transformer les tickets pour simplifier React
    $tickets->getCollection()->transform(function ($ticket) {
        $route = $ticket->trip?->route;

        return [
            'id' => $ticket->id,
            'client_name' => $ticket->client_name,
            'status' => $ticket->status,
            'seat_number' => $ticket->seat_number,
            'price' => $ticket->price,

            // Texte de l'itinéraire pré-calculé
            'route_text' => $route && $route->departureCity && $route->arrivalCity
                ? $route->departureCity->name . ' → ' . $route->arrivalCity->name
                : null,

            // Séparer les villes si besoin
            'departureCity' => $route?->departureCity
                ? ['name' => $route->departureCity->name]
                : null,
            'arrivalCity' => $route?->arrivalCity
                ? ['name' => $route->arrivalCity->name]
                : null,

            // Bagages
            'baggages' => $ticket->baggages->map(fn($b) => [
                'id' => $b->id,
                'description' => $b->description ?? null,
                'weight' => $b->weight ?? null,
                'price' => $b->price ?? null,
            ]),
        ];
    });

    // Retour vers Inertia
    return Inertia::render('Tickets/Index', [
        'tickets' => $tickets,
    ]);
}





public function dailySummary(Request $request)
    {
        // Optionnel : filtrer par agence, utilisateur ou dates
        $ticketsQuery = Ticket::query();

        if ($request->has('from') && $request->has('to')) {
            $from = Carbon::parse($request->from)->startOfDay();
            $to = Carbon::parse($request->to)->endOfDay();
            $ticketsQuery->whereBetween('created_at', [$from, $to]);
        }

        $tickets = $ticketsQuery
            ->select('id', 'created_at', 'price')
            ->orderBy('created_at', 'desc')
            ->get();

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
                'price' => $ticket->startStnop->partial_price,
            ] : null,
            'end_stop' => $ticket->endStop ? [
                'city_name' => $ticket->endStop->city?->name,
                'to_city_name' => $ticket->endStop->toCity?->name,
                'distance_from_start' => $ticket->endStop->distance_from_start,
                'price' => $ticket->endStop->partial_price,
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

}
