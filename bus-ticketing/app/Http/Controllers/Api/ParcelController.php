<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Models\Parcel;
use App\Models\Trip;
use App\Models\Agency;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
 use Illuminate\Validation\Rule;

class ParcelController extends Controller
{
    // Liste tous les colis (avec pagination)
    public function index(Request $request)
    {
        $user = $request->user();
        $query = Parcel::query();

        if ($user->role !== 'admin') {
            $agencyId = $user->agency_id;
            $query->where(function($q) use ($agencyId) {
                $q->where('departure_agency_id', $agencyId)
                  ->orWhere('arrival_agency_id', $agencyId);
            });
        }

        $parcels = $query->orderByDesc('created_at')
                         ->paginate(20)
                         ->withQueryString();

        return response()->json($parcels);
    }


     public function agences(Request $request)
    {
         $agencies = Agency::all(['id', 'name']); // ✅ récupérer toutes les agences

        return response()->json($agencies);
    }

    // Créer un colis
    public function store(Request $request)
    {
        $validated = $request->validate([
            'trip_id' => 'nullable|exists:trips,id',
            'tracking_number' => 'required|string|max:255|unique:parcels,tracking_number',
            'sender_name' => 'required|string|max:255',
            'sender_phone' => 'required|string|max:50',
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:50',
            'weight_kg' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|string|max:100',
            'parcel_image' => 'nullable|image|mimes:jpeg,jpg,png|max:20480',
            'departure_agency_id' => 'required|exists:agencies,id',
            'arrival_agency_id' => 'required|exists:agencies,id',
        ]);

        if ($request->hasFile('parcel_image')) {
            $path = Storage::disk('public_web')->putFile('parcels', $request->file('parcel_image'));
            $validated['parcel_image'] = $path;
        }

        $parcel = Parcel::create($validated);

        return response()->json([
            'message' => 'Colis créé avec succès',
            'parcel' => $parcel,
        ], 201);
    }



    // Afficher un colis
    public function show(Parcel $parcel)
    {
        $parcel->load(['trip.bus', 'trip.route.departureCity', 'trip.route.arrivalCity', 'departureAgency', 'arrivalAgency']);

        return response()->json([
            'parcel' => [
                'id' => $parcel->id,
                'tracking_number' => $parcel->tracking_number,
                'sender_name' => $parcel->sender_name,
                'recipient_name' => $parcel->recipient_name,
                'parcel_image' => $parcel->parcel_image ? Storage::disk('public_web')->url($parcel->parcel_image) : null,
                'departure_agency' => $parcel->departureAgency?->name,
                'arrival_agency' => $parcel->arrivalAgency?->name,
                'weight_kg' => $parcel->weight_kg,
                'price' => $parcel->price,
                'status' => $parcel->status,
                'description' => $parcel->description,
                'trip' => $parcel->trip ? [
                    'id' => $parcel->trip->id,
                    'departureCity' => $parcel->trip->route?->departureCity?->name,
                    'arrivalCity' => $parcel->trip->route?->arrivalCity?->name,
                    'departure_at' => optional($parcel->trip->departure_at)->format('Y-m-d H:i'),
                    'arrival_at' => optional($parcel->trip->arrival_at)->format('Y-m-d H:i'),
                    'bus_registration_number' => $parcel->trip->bus?->registration_number,
                ] : null,
            ],
        ]);
    }

    // Mettre à jour un colis
    public function update(Request $request, Parcel $parcel)
    {
        $validated = $request->validate([
            'trip_id' => 'nullable|exists:trips,id',
            'tracking_number' => [
    'required',
    'string',
    'max:255',
    Rule::unique('parcels')->ignore($parcel->id),
],

            'sender_name' => 'required|string|max:255',
            'sender_phone' => 'required|string|max:50',
            'recipient_name' => 'required|string|max:255',
            'recipient_phone' => 'required|string|max:50',
            'weight_kg' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|string|max:100',
            'parcel_image' => 'nullable|image|mimes:jpeg,jpg,png|max:20480',
            'departure_agency_id' => 'required|exists:agencies,id',
            'arrival_agency_id' => 'required|exists:agencies,id',
        ]);

        if ($request->hasFile('parcel_image')) {
            if ($parcel->parcel_image) {
                Storage::disk('public_web')->delete($parcel->parcel_image);
            }
            $path = Storage::disk('public_web')->putFile('parcels', $request->file('parcel_image'));
            $validated['parcel_image'] = $path;
        }

        $parcel->update($validated);

        return response()->json([
            'message' => 'Colis mis à jour avec succès',
            'parcel' => $parcel,
        ]);
    }

    // Supprimer un colis
    public function destroy(Parcel $parcel)
    {
        if ($parcel->parcel_image) {
            Storage::disk('public_web')->delete($parcel->parcel_image);
        }
        $parcel->delete();

        return response()->json(['message' => 'Colis supprimé avec succès']);
    }

    // Liste les colis par trajet
    public function indexByTrip(Trip $trip)
    {
        $parcels = Parcel::where('trip_id', $trip->id)
            ->orderByDesc('created_at')
            ->paginate(20);

        return response()->json([
            'trip_id' => $trip->id,
            'parcels' => $parcels,
        ]);
    }
}
