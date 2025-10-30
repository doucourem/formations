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
    // 🧾 Liste des tickets
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 1000);
        $user = Auth::user();

        $ticketsQuery = Ticket::with([
            'trip.route.departureCity',
            'trip.route.arrivalCity',
            'startStop.city',
            'startStop.toCity',
            'endStop.city',
            'endStop.toCity',
            'user.agency',
        ]);

        if ($user->role === 'agent') {
            $ticketsQuery->where('user_id', $user->id);
        } elseif ($user->role === 'manageragence') {
            $ticketsQuery->whereHas('user', fn($q) => $q->where('agence_id', $user->agence_id));
        }

        $tickets = $ticketsQuery->orderByDesc('created_at')
            ->paginate($perPage)
            ->withQueryString();

        $ticketsData = $tickets->getCollection()->map(fn($ticket) => [
            'id' => $ticket->id,
            'trip' => $ticket->trip ? [
                'id' => $ticket->trip->id,
                'route' => $ticket->trip->route ? [
                    'departure_city' => $ticket->trip->route->departureCity->name ?? '-',
                    'arrival_city' => $ticket->trip->route->arrivalCity->name ?? '-',
                    'departure_at' => $ticket->trip->departure_at,
                    'arrival_at' => $ticket->trip->arrival_at,
                ] : null,
            ] : null,
            'start_stop' => $ticket->startStop ? [
                'id' => $ticket->startStop->id,
                'city_name' => $ticket->startStop->city?->name ?? '-',
                'to_city_name' => $ticket->startStop->toCity?->name ?? '-',
                'distance_from_start' => $ticket->startStop->distance_from_start,
            ] : null,
            'end_stop' => $ticket->endStop ? [
                'id' => $ticket->endStop->id,
                'city_name' => $ticket->endStop->city?->name ?? '-',
                'to_city_name' => $ticket->endStop->toCity?->name ?? '-',
                'distance_from_start' => $ticket->endStop->distance_from_start,
            ] : null,
            'client_name' => $ticket->client_name,
            'seat_number' => $ticket->seat_number,
            'status' => $ticket->status,
            'price' => $ticket->price,
            'created_at' => $ticket->created_at->format('Y-m-d H:i:s'),
            'user' => $ticket->user ? [
                'name' => $ticket->user->name,
                'email' => $ticket->user->email,
                'agency' => $ticket->user->agency ? ['name' => $ticket->user->agency->name] : null,
            ] : null,
        ]);

        return Inertia::render('Tickets/Index', [
            'tickets' => [
                'data' => $ticketsData,
                'meta' => [
                    'current_page' => $tickets->currentPage(),
                    'last_page' => $tickets->lastPage(),
                    'per_page' => $tickets->perPage(),
                    'total' => $tickets->total(),
                ],
                'links' => $tickets->links(),
            ],
            'filters' => ['per_page' => $perPage],
        ]);
    }

    // ➕ Formulaire de création
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
            'tickets.user.agency',
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

    // 🔹 Vérification de l’ordre uniquement si les deux stops existent
    if (($startStop && $endStop) && $startStop->order > $endStop->order) {
        return back()->withErrors(['start_stop_id' => 'Arrêt de départ ou d’arrivée invalide'])->withInput();
    }

    // 🔹 Vérification du siège uniquement si les arrêts existent
    $seatTaken = false;
    if (!empty($data['seat_number']) && $startStop && $endStop) {
        $seatTaken = $trip->tickets->filter(function ($t) use ($trip, $startStop, $endStop, $data) {
            $tStart = $trip->route->stops->where('id', $t->start_stop_id)->first()?->order;
            $tEnd = $trip->route->stops->where('id', $t->end_stop_id)->first()?->order;

            // Si le siège overlap avec le trajet choisi
            return $t->seat_number === $data['seat_number'] &&
                   $tStart !== null &&
                   $tEnd !== null &&
                   !($tEnd < $startStop->order || $tStart > $endStop->order);
        })->isNotEmpty();
    }

    if ($seatTaken) {
        return back()->withErrors(['seat_number' => 'Ce siège est déjà réservé sur cet intervalle d’arrêts.'])->withInput();
    }

    // 🔹 Calcul du prix
    if ($startStop && $endStop) {
        // Cas 1 : arrêts spécifiés → somme des sous-prix
        $data['price'] = $trip->route->stops
            ->where('order', '>=', $startStop->order)
            ->where('order', '<=', $endStop->order)
            ->sum('partial_price');
    } else {
        // Cas 2 : aucun arrêt choisi → prix complet du trajet
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

    // Vérification de l’ordre uniquement si les deux stops existent
    if (($startStop && $endStop) && $startStop->order > $endStop->order) {
        return back()->withErrors(['start_stop_id' => 'Arrêt de départ ou d’arrivée invalide'])->withInput();
    }

    // 🔹 Vérifier si le siège est déjà réservé sur l’intervalle choisi
    $seatTaken = false;
    if (!empty($data['seat_number']) && $startStop && $endStop) {
        $seatTaken = $trip->tickets->filter(function ($t) use ($trip, $startStop, $endStop, $data, $ticket) {
            $tStart = $trip->route->stops->where('id', $t->start_stop_id)->first()?->order;
            $tEnd = $trip->route->stops->where('id', $t->end_stop_id)->first()?->order;

            return $t->id !== $ticket->id &&
                   $t->seat_number === $data['seat_number'] &&
                   $tStart !== null &&
                   $tEnd !== null &&
                   !($tEnd < $startStop->order || $tStart > $endStop->order);
        })->isNotEmpty();
    }

    if ($seatTaken) {
        return back()->withErrors(['seat_number' => 'Ce siège est déjà réservé sur cet intervalle d’arrêts.'])->withInput();
    }

    // 🔹 Calcul du prix uniquement si les deux stops existent
    if ($startStop && $endStop) {
        $data['price'] = $trip->route->stops
            ->where('order', '>=', $startStop->order)
            ->where('order', '<=', $endStop->order)
            ->sum('partial_price');
    } else {
       $data['price'] = $trip->route->price ?? 0;
    }

    $data['user_id'] = Auth::id();

    $ticket->update($data);

    return redirect()->route('ticket.index')->with('success', 'Ticket mis à jour avec succès ✅');
}


    public function destroy(Ticket $ticket)
    {
        $this->authorizeAgent();
        $ticket->delete();

        return redirect()->route('ticket.index')->with('success', 'Ticket supprimé avec succès ✅');
    }

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
                    'price' => $ticket->startStop->partial_price,
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
            ],
        ]);
    }

    private function authorizeAgent()
    {
        
    }
}
