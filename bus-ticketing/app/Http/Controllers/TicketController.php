<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
  public function index(Request $request)
{
    $perPage = $request->input('per_page', 20);

   $tickets = Ticket::with(['trip.route', 'user'])
    ->orderBy('created_at', 'desc')
    ->paginate($perPage)
    ->withQueryString();


    // Transformer pour Inertia + éviter les null
    $ticketsData = $tickets->map(function ($ticket) {
        return [
            'id' => $ticket->id,
            'trip' => $ticket->trip ? [
                'id' => $ticket->trip->id,
                'route' => $ticket->trip->route ? [
                    'id' => $ticket->trip->route->id,
                    'departure_city' => $ticket->trip->route->departureCity->name ?? '-',
                    'arrival_city' => $ticket->trip->route->arrivalCity->name ?? '-',
                    'departure_at' => $ticket->trip->departure_at,
                    'arrival_at' => $ticket->trip->arrival_at,
                ] : null,
            ] : null,
            'client_name' => $ticket->client_name,
            'client_nina' => $ticket->client_nina,
            'seat_number' => $ticket->seat_number,
            'price' => $ticket->price,
            'status' => $ticket->status,
            'created_at' => $ticket->created_at,
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


public function create()
{
    $trips = Trip::with([
        'route.departureCity',
        'route.arrivalCity'
    ])->get();

    // Transformer pour JSON Inertia
    $trips = $trips->map(function($t) {
        return [
            'id' => $t->id,
            'departure_at' => $t->departure_at,
            'route' => [
                'id' => $t->route->id,
                'departureCity' => $t->route->departureCity ? ['name' => $t->route->departureCity->name] : null,
                'arrivalCity' => $t->route->arrivalCity ? ['name' => $t->route->arrivalCity->name] : null,
            ]
        ];
    });

    return Inertia::render('Tickets/Form', [
        'trips' => $trips,
    ]);
}



    public function store(Request $request)
    {
        $data = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'client_name' => 'required|string|max:255',
            'client_nina' => 'nullable|string|max:255',
            'seat_number' => 'nullable|string|max:10',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:booked,paid,cancelled',
        ]);

        $data['user_id'] = Auth::id(); // association au user connecté

        Ticket::create($data);

        return redirect()->route('ticket.index')
                         ->with('success', 'Ticket créé avec succès ✅');
    }

    public function edit(Ticket $ticket)
    {
        $trips = Trip::with('route')->get();

        return Inertia::render('Tickets/Form', [
            'ticket' => $ticket,
            'trips' => $trips,
        ]);
    }

    public function update(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'trip_id' => 'required|exists:trips,id',
            'client_name' => 'required|string|max:255',
            'client_nina' => 'nullable|string|max:255',
            'seat_number' => 'nullable|string|max:10',
            'price' => 'required|numeric|min:0',
            'status' => 'required|in:booked,paid,cancelled',
        ]);

        $data['user_id'] = Auth::id();

        $ticket->update($data);

        return redirect()->route('ticket.index')
                         ->with('success', 'Ticket mis à jour avec succès ✅');
    }

    public function destroy(Ticket $ticket)
    {
        $ticket->delete();

        return redirect()->route('ticket.index')
                         ->with('success', 'Ticket supprimé avec succès ✅');
    }
}
