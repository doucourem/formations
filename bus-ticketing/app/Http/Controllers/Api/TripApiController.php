<?php
// app/Http/Controllers/Api/TripApiController.php
namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Trip;

class TripApiController extends Controller
{
    /**
     * Liste des voyages
     */
    public function index(Request $request)
    {
        $trips = Trip::with(['route.departureCity', 'route.arrivalCity', 'bus'])
            ->orderBy('departure_at', 'asc')
            ->paginate(20); // pagination, 20 par page

        return response()->json($trips);
    }

    /**
     * Détails d’un voyage
     */
    public function show($id)
    {
        $trip = Trip::with(['route.departureCity', 'route.arrivalCity', 'bus', 'seats'])->findOrFail($id);
        return response()->json($trip);
    }

    public function seats($tripId)
    {
        $trip = Trip::with('bus')->findOrFail($tripId);

        // Exemple : générer les sièges selon la capacité du bus
        $capacity = $trip->bus->capacity;
        $reservedSeats = $trip->tickets()->pluck('seat_number')->toArray();

        $seats = [];
        for ($i = 1; $i <= $capacity; $i++) {
            $seats[] = [
                'seat_number' => (string)$i,
                'status' => in_array($i, $reservedSeats) ? 'reserved' : 'available'
            ];
        }

        return response()->json($seats);
    }
}
