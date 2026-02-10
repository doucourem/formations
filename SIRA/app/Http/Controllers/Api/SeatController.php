<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Ticket;
use App\Models\Trip;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Illuminate\Support\Facades\Auth;

class SeatController extends Controller
{
    // 🔹 Lister les sièges avec leur statut
    public function availableSeats($tripId)
    {
        $trip = Trip::with('tickets')->findOrFail($tripId);

        $busCapacity = $trip->bus?->capacity ?? 0;
        $seats = [];

        for ($i = 1; $i <= $busCapacity; $i++) {
            $occupied = $trip->tickets->contains('seat_number', (string)$i);
            $seats[] = [
                'seat_number' => (string)$i,
                'status' => $occupied ? 'reserved' : 'available',
            ];
        }

        return response()->json($seats);
    }


    public function reserve(Request $request)
{
    $request->validate([
        'trip_id' => 'required|exists:trips,id',
        'seat_number' => 'required',
        'client_name' => 'nullable|string|max:255',
        'start_stop_id' => 'nullable|exists:route_stops,id',
        'end_stop_id' => 'nullable|exists:route_stops,id',
    ]);

    $trip = Trip::with('route.stops', 'tickets')->findOrFail($request->trip_id);

    $startStop = $trip->route->stops->where('id', $request->start_stop_id)->first();
    $endStop = $trip->route->stops->where('id', $request->end_stop_id)->first();

    // 🔹 Vérification du siège
    $seatTaken = $trip->tickets->filter(function ($t) use ($request, $trip, $startStop, $endStop) {
        if ($t->seat_number !== $request->seat_number) return false;

        if ($startStop && $endStop && $t->start_stop_id && $t->end_stop_id) {
            $tStart = $trip->route->stops->where('id', $t->start_stop_id)->first()?->order;
            $tEnd = $trip->route->stops->where('id', $t->end_stop_id)->first()?->order;
            return $tStart !== null && $tEnd !== null &&
                   !($tEnd < $startStop->order || $tStart > $endStop->order);
        }

        return true; // conflit si stops manquants
    })->isNotEmpty();

    if ($seatTaken) {
        return response()->json(['error' => 'Ce siège est déjà réservé'], 409);
    }

    // 🔹 Calcul automatique du prix
    $price = ($startStop && $endStop)
        ? $trip->route->stops
            ->where('order', '>=', $startStop->order)
            ->where('order', '<=', $endStop->order)
            ->sum('partial_price')
        : ($trip->route->price ?? 0);

    $ticket = Ticket::create([
        'trip_id' => $request->trip_id,
        'seat_number' => $request->seat_number,
        'start_stop_id' => $startStop?->id,
        'end_stop_id' => $endStop?->id,
        'client_name' => $request->client_name ?? 'Client anonyme',
        'status' => 'reserved',
        'user_id' => Auth::id(),
        'price' => $price, // ← important !
    ]);

    return response()->json([
        'success' => true,
        'ticket' => $ticket,
    ]);
}


}
