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
        $tickets = Ticket::with(['trip.route.departureCity','trip.route.arrivalCity','baggages'])
            ->orderBy('id', 'desc')
            ->paginate(20);

        return response()->json($tickets);
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

        $ticket = Ticket::create(array_merge($request->all(), ['user_id' => Auth::id()]));
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
}
