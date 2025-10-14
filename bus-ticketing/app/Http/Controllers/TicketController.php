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
        $perPage = $request->input('per_page', 10);

        $tickets = Ticket::with([
            'trip.route.departureCity',
            'trip.route.arrivalCity',
            'stop.city',
            'user.agency',
        ])
        ->where('user_id', Auth::id())
        ->orderBy('created_at', 'desc')
        ->paginate($perPage)
        ->withQueryString();

        $ticketsData = $tickets->getCollection()->map(function ($ticket) {
            return [
                'id' => $ticket->id,
                'trip' => $ticket->trip ? [
                    'id' => $ticket->trip->id,
                    'route' => $ticket->trip->route ? [
                        'departure_city' => $ticket->trip->route->departureCity->name ?? '-',
                        'arrival_city' => $ticket->trip->route->arrivalCity->name ?? '-',
                        'departure_at' => $ticket->trip->departure_at,
                        'arrival_at' => $ticket->trip->arrival_at,
                        'price' => $ticket->stop ? $ticket->stop->price : $ticket->trip->route->price,
                    ] : null,
                ] : null,
                'stop' => $ticket->stop ? [
                    'id' => $ticket->stop->id,
                    'city_name' => $ticket->stop->city?->name,
                    'distance_from_start' => $ticket->stop->distance_from_start,
                    'price' => $ticket->stop->price,
                ] : null,
                'client_name' => $ticket->client_name,
                'seat_number' => $ticket->seat_number,
                'status' => $ticket->status,
                'price' => $ticket->price,
                'created_at' => $ticket->created_at->format('Y-m-d H:i:s'),
                'user' => $ticket->user ? [
                    'name' => $ticket->user->name,
                    'email' => $ticket->user->email,
                    'agency' => $ticket->user->agency ? [
                        'name' => $ticket->user->agency->name
                    ] : null,
                ] : null,
            ];
        });

        return Inertia::render('Tickets/Index', [
            'tickets' => [
                'data' => $ticketsData,
                'meta' => [
                    'current_page' => $tickets->currentPage(),
                    'last_page' => $tickets->lastPage(),
                    'per_page' => $tickets->perPage(),
                    'total' => $tickets->total(),
                ],
            ],
            'filters' => ['per_page' => $perPage],
        ]);
    }

    // ➕ Formulaire de création
   public function create()
{
    // Définir la locale française pour Carbon
    Carbon::setLocale('fr');
    $today = Carbon::now();

    // Récupérer les trajets futurs avec relations nécessaires
    $trips = Trip::with([
        'route.departureCity',
        'route.arrivalCity',
        'route.stops.city',
        'bus',
        'tickets.user.agency', // utile si tu veux lister les sièges occupés par agence
    ])
    ->whereDate('departure_at', '>=', $today)
    ->get()
    ->map(function ($t) {
        return [
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
                'stops' => $t->route->stops->map(function ($s) {
                    return [
                        'id' => $s->id,
                        'distance_from_start' => $s->distance_from_start,
                        'price' => $s->price,
                        'city' => $s->city ? ['name' => $s->city->name] : null,
                    ];
                }),
            ],
            'tickets' => $t->tickets->map(function ($ticket) {
                return [
                    'id' => $ticket->id,
                    'seat_number' => $ticket->seat_number,
                    'client_name' => $ticket->client_name,
                    'user' => $ticket->user ? [
                        'agency' => $ticket->user->agency ? ['name' => $ticket->user->agency->name] : null,
                    ] : null,
                ];
            }),
        ];
    });

    return Inertia::render('Tickets/Form', ['trips' => $trips]);
}


    public function store(Request $request)
    {
        $data = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'stop_id' => 'nullable|exists:route_stops,id',
            'client_name' => 'required|string|max:255',
            'client_nina' => 'nullable|string|max:255',
            'seat_number' => 'nullable|string|max:10',
            'status' => 'required|in:reserved,paid,cancelled',
        ]);

        // Vérification du siège unique
        if (!empty($data['seat_number'])) {
            $exists = Ticket::where('trip_id', $data['trip_id'])
                ->where('seat_number', $data['seat_number'])
                ->exists();
            if ($exists) {
                return back()->withErrors(['seat_number' => 'Ce siège est déjà réservé pour ce voyage.'])->withInput();
            }
        }

        $trip = Trip::with('route', 'route.stops')->findOrFail($data['trip_id']);

        if (!empty($data['stop_id'])) {
            $stop = $trip->route->stops->where('id', $data['stop_id'])->first();
            $data['price'] = $stop->price ?? $trip->route->price ?? 0;
        } else {
            $data['price'] = $trip->route->price ?? 0;
        }

        $data['user_id'] = Auth::id();

        Ticket::create($data);

        return redirect()->route('ticket.index')->with('success', 'Ticket créé avec succès ✅');
    }

    public function update(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'stop_id' => 'nullable|exists:route_stops,id',
            'client_name' => 'required|string|max:255',
            'client_nina' => 'nullable|string|max:255',
            'seat_number' => 'nullable|string|max:10',
            'status' => 'required|in:reserved,paid,cancelled',
        ]);

        // Vérification du siège unique (hors ticket actuel)
        if (!empty($data['seat_number'])) {
            $exists = Ticket::where('trip_id', $data['trip_id'])
                ->where('seat_number', $data['seat_number'])
                ->where('id', '!=', $ticket->id)
                ->exists();
            if ($exists) {
                return back()->withErrors(['seat_number' => 'Ce siège est déjà réservé pour ce voyage.'])->withInput();
            }
        }

        $trip = Trip::with('route', 'route.stops')->findOrFail($data['trip_id']);

        if (!empty($data['stop_id'])) {
            $stop = $trip->route->stops->where('id', $data['stop_id'])->first();
            $data['price'] = $stop->price ?? $trip->route->price ?? 0;
        } else {
            $data['price'] = $trip->route->price ?? 0;
        }

        $data['user_id'] = Auth::id();

        $ticket->update($data);

        return redirect()->route('ticket.index')->with('success', 'Ticket mis à jour avec succès ✅');
    }

    public function edit(Ticket $ticket)
    {
        $today = Carbon::now();

        $trips = Trip::with([
            'route.departureCity',
            'route.arrivalCity',
            'route.stops.city',
        ])
        ->whereDate('departure_at', '>=', $today)
        ->get()->map(function ($t) {
            return [
                'id' => $t->id,
                'departure_at' => Carbon::parse($t->departure_at)->translatedFormat('l d F Y H:i'),
                'route' => $t->route ? [
                    'departureCity' => $t->route->departureCity ? ['name' => $t->route->departureCity->name] : null,
                    'arrivalCity' => $t->route->arrivalCity ? ['name' => $t->route->arrivalCity->name] : null,
                    'stops' => $t->route->stops->map(function ($s) {
                        return [
                            'id' => $s->id,
                            'distance_from_start' => $s->distance_from_start,
                            'price' => $s->price,
                            'city' => $s->city ? ['name' => $s->city->name] : null,
                        ];
                    }),
                ] : null,
            ];
        });

        return Inertia::render('Tickets/Form', ['ticket' => $ticket, 'trips' => $trips]);
    }

    public function destroy(Ticket $ticket)
    {
        $ticket->delete();
        return redirect()->route('ticket.index')->with('success', 'Ticket supprimé avec succès ✅');
    }

    public function show($id)
{
    $ticket = Ticket::with([
        'trip.route.departureCity',
        'trip.route.arrivalCity',
        'trip.bus',
        'stop.city',
        'user.agency',
    ])->findOrFail($id);

    return Inertia::render('Tickets/Show', [
        'ticket' => [
            'id' => $ticket->id,
            'seat_number' => $ticket->seat_number,
            'client_name' => $ticket->client_name,
            'status' => $ticket->status,
            'price' => $ticket->price,
            'stop' => $ticket->stop ? [
                'id' => $ticket->stop->id,
                'city_name' => $ticket->stop->city?->name,
                'distance_from_start' => $ticket->stop->distance_from_start,
                'price' => $ticket->stop->price,
            ] : null,
            'user' => $ticket->user ? [
                'id' => $ticket->user->id,
                'name' => $ticket->user->name,
                'email' => $ticket->user->email,
                'agency' => $ticket->user->agency ? [
                    'id' => $ticket->user->agency->id,
                    'name' => $ticket->user->agency->name,
                ] : null,
            ] : null,
            'trip' => $ticket->trip ? [
                'id' => $ticket->trip->id,
                'departure_time' => $ticket->trip->departure_at
                    ? Carbon::parse($ticket->trip->departure_at)->format('d/m/Y H:i')
                    : null,
                'arrival_time' => $ticket->trip->arrival_at
                    ? Carbon::parse($ticket->trip->arrival_at)->format('d/m/Y H:i')
                    : null,
                'bus' => $ticket->trip->bus ? [
                    'id' => $ticket->trip->bus->id,
                    'model' => $ticket->trip->bus->model,
                    'registration_number' => $ticket->trip->bus->registration_number,
                ] : null,
                'route' => $ticket->trip->route ? [
                    'id' => $ticket->trip->route->id,
                    'departureCity' => $ticket->trip->route->departureCity?->name,
                    'arrivalCity' => $ticket->trip->route->arrivalCity?->name,
                    'price' => $ticket->stop ? $ticket->stop->price : $ticket->trip->route->price,
                    'stops' => $ticket->trip->route->stops->map(fn($s) => [
                        'id' => $s->id,
                        'city_name' => $s->city?->name,
                        'distance_from_start' => $s->distance_from_start,
                        'price' => $s->price,
                    ]),
                ] : null,
            ] : null,
        ],
    ]);
}

}
