<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TicketController extends Controller
{
    /**
     * Affiche la liste des tickets.
     */
    public function index(Request $request)
    {
        $perPage = $request->input('per_page', 20);

        $tickets = Ticket::with('trip.route') // charger le voyage et sa route
            ->orderBy('created_at', 'desc')
            ->paginate($perPage)
            ->withQueryString();

        return Inertia::render('Tickets/Index', [
            'tickets' => $tickets,
            'filters' => [
                'per_page' => $perPage,
            ],
        ]);
    }

    /**
     * Affiche le formulaire de création d'un ticket.
     */
    public function create()
    {
        $trips = Trip::with('route')->get();

        return Inertia::render('Tickets/Form', [
            'trips' => $trips,
        ]);
    }

    /**
     * Stocke un nouveau ticket.
     */
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

        Ticket::create($data);

        return redirect()->route('tickets.index')
                         ->with('success', 'Ticket créé avec succès ✅');
    }

    /**
     * Affiche le formulaire d'édition d'un ticket.
     */
    public function edit(Ticket $ticket)
    {
        $trips = Trip::with('route')->get();

        return Inertia::render('Tickets/Form', [
            'ticket' => $ticket,
            'trips' => $trips,
        ]);
    }

    /**
     * Met à jour un ticket existant.
     */
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

        $ticket->update($data);

        return redirect()->route('tickets.index')
                         ->with('success', 'Ticket mis à jour avec succès ✅');
    }

    /**
     * Supprime un ticket.
     */
    public function destroy(Ticket $ticket)
    {
        $ticket->delete();

        return redirect()->route('tickets.index')
                         ->with('success', 'Ticket supprimé avec succès ✅');
    }
}
