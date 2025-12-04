<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use App\Models\Trip; // <-- 1. Import the Trip model
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
class ParcelController extends Controller
{
    /**
     * List all parcels
     */
    public function index()
    {
        $parcels = Parcel::orderBy('created_at', 'desc')->paginate(20);
        return inertia('Parcels/Index', [
            'parcels' => $parcels
        ]);
    }

    /**
     * Show create form
     */
    public function create()
{

    Carbon::setLocale('fr');
    $today = Carbon::now();

    // Récupération des voyages futurs avec bus, route et stops
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

    // Récupération de tous les stops pour le select
   
    return Inertia::render('Parcels/Create', [
        'trips' => $trips,
    ]);
}


    /**
     * Store a new parcel
     */
  public function store(Request $request)
{
    $validated = $request->validate([
        'trip_id'         => 'required|exists:trips,id',
        'tracking_number' => 'required|string|max:255|unique:parcels,tracking_number',
        'sender_name'     => 'required|string|max:255',
        'sender_phone'    => 'required|string|max:50',
        'recipient_name'  => 'required|string|max:255',
        'recipient_phone' => 'required|string|max:50',
        'weight_kg'       => 'required|numeric|min:0',
        'price'           => 'required|numeric|min:0',
        'description'     => 'nullable|string',
        'status'          => 'required|string|max:100',
        'parcel_image'    => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
    ]);

    // Gestion du fichier
    if ($request->hasFile('parcel_image')) {
        $path = $request->file('parcel_image')->store('parcels', 'public');
        $validated['parcel_image'] = $path;
    }

    Parcel::create($validated);

    return redirect()->route('parcels.index')
        ->with('success', 'Colis créé avec succès.');
}



    /**
     * Show edit form
     */
    public function edit(Parcel $parcel)
    {
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
        return inertia('Parcels/Edit', [
             'trips' => $trips,
            'parcel' => $parcel
        ]);
    }

    /**
     * Update an existing parcel
     */
public function update(Request $request, Parcel $parcel)
{
    $validated = $request->validate([
        'trip_id'           => 'required|exists:trips,id',
        'tracking_number'   => 'required|string|max:255|unique:parcels,tracking_number,' . $parcel->id,
        'sender_name'       => 'required|string|max:255',
        'sender_phone'      => 'required|string|max:50',
        'recipient_name'    => 'required|string|max:255',
        'recipient_phone'   => 'required|string|max:50',
        'weight_kg'         => 'required|numeric|min:0',
        'price'             => 'required|numeric|min:0',
        'description'       => 'nullable|string',
        'status'            => 'required|string|max:100',
        'parcel_image'      => 'nullable|image|mimes:jpeg,jpg,png|max:2048', // 🔹 validation image
    ]);

    // Gestion du fichier image
    if ($request->hasFile('parcel_image')) {
        // Supprimer l’ancienne image si existante
        if ($parcel->parcel_image && \Storage::disk('public')->exists($parcel->parcel_image)) {
            \Storage::disk('public')->delete($parcel->parcel_image);
        }
        // Stocker la nouvelle image
        $path = $request->file('parcel_image')->store('parcels', 'public');
        $validated['parcel_image'] = $path;
    }

    $parcel->update($validated);

    return redirect()->route('parcels.index')
        ->with('success', 'Colis mis à jour avec succès.');
}



    /**
     * Delete a parcel
     */
    public function destroy(Parcel $parcel)
    {
        $parcel->delete();

        return redirect()->route('parcels.index')
            ->with('success', 'Colis supprimé avec succès.');
    }

public function indexByTrip(Trip $trip)
{
    // Charger les relations nécessaires
    $trip->load([
        'route.departureCity',
        'route.arrivalCity',
        'bus',
    ]);

    // Récupérer les colis liés au trajet, paginés
    $parcels = Parcel::where('trip_id', $trip->id)
        ->orderByDesc('created_at')
        ->paginate(20);

    return Inertia::render('Parcels/IndexByTrip', [
        'trip' => [
            'id' => $trip->id,
            'departure_time' => $trip->departure_at
                ? \Carbon\Carbon::parse($trip->departure_at)->format('d/m/Y H:i')
                : null,
            'arrival_time' => $trip->arrival_at
                ? \Carbon\Carbon::parse($trip->arrival_at)->format('d/m/Y H:i')
                : null,
            'bus' => $trip->bus ? [
                'registration_number' => $trip->bus->registration_number,
            ] : null,
            'route' => $trip->route ? [
                'departureCity' => $trip->route->departureCity?->name ?? '-',
                'arrivalCity' => $trip->route->arrivalCity?->name ?? '-',
                'price' => $trip->route->price ?? 0,
            ] : null,
        ],

        // Transformation des colis pour le front
        'parcels' => $parcels->through(fn($parcel) => [
            'id' => $parcel->id,
            'description' => $parcel->description,
            'weight' => $parcel->weight,
            'price' => $parcel->price ?? 0,
            'sender_name' => $parcel->sender_name,
            'recipient_name' => $parcel->recipient_name,
            'recipient_phone' => $parcel->recipient_phone,
            'status' => $parcel->status,
        ]),

        // Pagination meta pour le front (pratique si tu veux TablePagination MUI)
        'pagination' => [
            'current_page' => $parcels->currentPage(),
            'last_page' => $parcels->lastPage(),
            'per_page' => $parcels->perPage(),
            'total' => $parcels->total(),
        ],
    ]);
}

public function show(Parcel $parcel)
{
    // Charger les relations nécessaires
    $parcel->load([
        'trip.route.departureCity',
        'trip.route.arrivalCity',
        'trip.bus',
    ]);

    return Inertia::render('Parcels/Show', [
        'parcel' => [
            'id' => $parcel->id,
            'tracking_number' => $parcel->tracking_number,
            'sender_name' => $parcel->sender_name,
            'recipient_name' => $parcel->recipient_name,
            'weight_kg' => $parcel->weight_kg,
            'price' => $parcel->price,
            'status' => $parcel->status,
            'description' => $parcel->description,
            'trip' => $parcel->trip ? [
                'id' => $parcel->trip->id,
                'departureCity' => $parcel->trip->route->departureCity?->name,
                'arrivalCity' => $parcel->trip->route->arrivalCity?->name,
                'departure_at' => $parcel->trip->departure_at
                    ? \Carbon\Carbon::parse($parcel->trip->departure_at)->format('d/m/Y H:i')
                    : null,
                'arrival_at' => $parcel->trip->arrival_at
                    ? \Carbon\Carbon::parse($parcel->trip->arrival_at)->format('d/m/Y H:i')
                    : null,
                'bus' => $parcel->trip->bus ? [
                    'registration_number' => $parcel->trip->bus->registration_number,
                ] : null,
            ] : null,
        ],
    ]);
}



}