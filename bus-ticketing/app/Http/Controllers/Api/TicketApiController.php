<?php
// app/Http/Controllers/Api/TicketApiController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Trip;
use Illuminate\Support\Facades\Auth;

class TicketApiController extends Controller
{
  public function index(Request $request)
{
    // Récupération des filtres
    $search = $request->query('search');    // nom du client
    $status = $request->query('status');    // reserved, paid, cancelled
    $date = $request->query('date');        // YYYY-MM-DD

    // Construction de la requête avec relations
    $query = Ticket::with([
        'trip.route.departureCity',
        'trip.route.arrivalCity',
        'baggages'
    ])->orderBy('id', 'desc');

    // Filtre client
    if ($search) {
        $query->where('client_name', 'like', "%{$search}%");
    }

    // Filtre statut
    if ($status) {
        $query->where('status', $status);
    }

    // Filtre date (basé sur la date de création)
    if ($date) {
        $query->whereDate('created_at', $date);
    }

    // Pagination
    $tickets = $query->paginate(20);

    // Transformation pour le front
    $ticketsTransformed = $tickets->getCollection()->transform(function ($ticket) {
        return [
            'id' => $ticket->id,
            'client_name' => $ticket->client_name,
            'seat_number' => $ticket->seat_number,
            'price' => $ticket->price,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at->format('d/m/Y H:i'),
            'trip' => $ticket->trip ? [
                'id' => $ticket->trip->id,
                'departureCity' => $ticket->trip->route?->departureCity?->name ?? '-',
                'arrivalCity' => $ticket->trip->route?->arrivalCity?->name ?? '-',
                'departure_at' => $ticket->trip->departure_at,
                'arrival_at' => $ticket->trip->arrival_at,
            ] : null,
            'baggages' => $ticket->baggages ?? [],
        ];
    });

    // Retour JSON avec pagination
    return response()->json([
        'data' => $ticketsTransformed,
        'meta' => [
            'current_page' => $tickets->currentPage(),
            'last_page' => $tickets->lastPage(),
            'per_page' => $tickets->perPage(),
            'total' => $tickets->total(),
        ],
    ]);
}



    public function show($id)
    {
        $ticket = Ticket::with(['trip.route','baggages','startStop.city','endStop.city'])->findOrFail($id);
        return response()->json($ticket);
    }

    public function store(Request $request)
{
    $request->validate([
        'trip_id' => 'required|exists:trips,id',
        'start_stop_id' => 'nullable|exists:route_stops,id',
        'end_stop_id' => 'nullable|exists:route_stops,id',
        'client_name' => 'required|string|max:255',
        'seat_number' => 'nullable|string|max:10',
        'status' => 'required|in:reserved,paid,cancelled',
    ]);

    $trip = Trip::with('route.stops')->findOrFail($request->trip_id);
    $startStop = $trip->route->stops->where('id', $request->start_stop_id)->first();
    $endStop = $trip->route->stops->where('id', $request->end_stop_id)->first();

    // 🔹 Calcul du prix
    if ($startStop && $endStop) {
        $price = $trip->route->stops
            ->where('order', '>=', $startStop->order)
            ->where('order', '<=', $endStop->order)
            ->sum('partial_price');
    } else {
        $price = $trip->route->price ?? 0;
    }

    $ticket = Ticket::create(array_merge(
        $request->all(),
        [
            'user_id' => Auth::id(),
            'price' => $price, // <- important
        ]
    ));

    return response()->json($ticket, 201);
}


    public function update(Request $request, $id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->update($request->all());
        return response()->json($ticket);
    }

    public function destroy($id)
    {
        $ticket = Ticket::findOrFail($id);
        $ticket->delete();
        return response()->json(['message' => 'Ticket supprimé']);
    }

    public function search(Request $request)
    {
        $departure = $request->input('departure');
        $arrival = $request->input('arrival');
        $date = $request->input('date');

        $ticketsQuery = Ticket::with(['trip.route.departureCity','trip.route.arrivalCity','trip.bus']);

        if ($departure) {
            $ticketsQuery->whereHas('trip.route.departureCity', fn($q) => $q->where('name', 'like', "%$departure%"));
        }
        if ($arrival) {
            $ticketsQuery->whereHas('trip.route.arrivalCity', fn($q) => $q->where('name', 'like', "%$arrival%"));
        }
        if ($date) {
            $ticketsQuery->whereHas('trip', fn($q) => $q->whereDate('departure_at', $date));
        }

        $tickets = $ticketsQuery->get();
        return response()->json($tickets);
    }

public function byTrip($tripId)
{
    $trip = Trip::with(['route.departureCity', 'route.arrivalCity', 'bus', 'tickets.user.agency'])
                ->find($tripId);

    if (!$trip) {
        return response()->json([
            'message' => 'Voyage non trouvé'
        ], 404);
    }

    $tickets = $trip->tickets->map(function ($ticket) {
        return [
            'id' => $ticket->id,
            'client_name' => $ticket->client_name,
            'seat_number' => $ticket->seat_number,
            'price' => $ticket->price,
            'status' => $ticket->status, // ou traduire en front
            'created_at' => $ticket->created_at->format('d/m/Y H:i'),
            'user' => $ticket->user ? [
                'name' => $ticket->user->name,
                'email' => $ticket->user->email,
                'agency' => $ticket->user->agency ? ['name' => $ticket->user->agency->name] : null,
            ] : null,
        ];
    });

    $tripData = [
        'id' => $trip->id,
        'departureCity' => $trip->route?->departureCity?->name ?? '-',
        'arrivalCity' => $trip->route?->arrivalCity?->name ?? '-',
        'departure_at' => $trip->departure_at,
        'arrival_at' => $trip->arrival_at,
        'bus' => $trip->bus ? [
            'id' => $trip->bus->id,
            'registration_number' => $trip->bus->registration_number,
            'capacity' => $trip->bus->capacity,
        ] : null,
        'tickets' => $tickets,
    ];

    return response()->json(['data' => $tripData]);
}



}
