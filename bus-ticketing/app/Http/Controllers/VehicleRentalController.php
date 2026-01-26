<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\VehicleRental;
use App\Models\VehicleRentalExpense;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use App\Models\Driver;

class VehicleRentalController extends Controller
{
 

/**
 * Liste des locations avec leurs dépenses.
 */
public function index(Request $request)
{
    $rentals = VehicleRental::with(['bus', 'expenses']) // charger bus et expenses
        ->latest()
        ->paginate(15) // paginate au lieu de get()
        ->withQueryString(); // conserve recherche et filtres

       

    $vehicles = VehicleRentalExpense::all();
    //dd($vehicles);
    return Inertia::render('VehicleRentals/Index', [
        'rentals' => $rentals
    ]);
}




    
    /**
     * Formulaire de création.
     */
    public function create()
{
    return Inertia::render('VehicleRentals/Create', [
        'vehicles' => Bus::all(),
        'drivers'  => Driver::all(),
    ]);
}


    /**
     * Enregistrer une location.
     */
    // --- store() ---
public function store(Request $request)
{
    $data = $request->validate([
        'vehicle_id' => 'required|exists:buses,id',
        'driver_id' => 'required|exists:drivers,id',
        'client_name' => 'required|string|max:255',
        'rental_price' => 'required|numeric|min:0',
        'rental_start' => 'required|date',
        'rental_end' => 'required|date|after:rental_start',
        'departure_location' => 'required|string|max:255', // ajouté
        'arrival_location' => 'required|string|max:255',   // ajouté
        'status' => 'nullable|in:active,completed,cancelled',
    ]);

    // Vérifier conflit avec une location existante
    $conflict = VehicleRental::where('vehicle_id', $data['vehicle_id'])
        ->where('status', 'active')
        ->where(function ($q) use ($data) {
            $q->whereBetween('rental_start', [$data['rental_start'], $data['rental_end']])
              ->orWhereBetween('rental_end', [$data['rental_start'], $data['rental_end']]);
        })
        ->exists();

    if ($conflict) {
        return redirect()->back()->with('error', 'Le véhicule est déjà loué sur cette période.');
    }

    $data['status'] = $data['status'] ?? 'active';
    VehicleRental::create($data);

    return redirect()->route('vehicle-rentals.index')
                     ->with('success', 'Location créée avec succès.');
}




public function edit(VehicleRental $vehicle_rental)
{
    $vehicle_rental->load(['driver', 'bus']);

    return Inertia::render('VehicleRentals/Edit', [
        'rental' => [
            'id' => $vehicle_rental->id,
            'vehicle_id' => $vehicle_rental->vehicle_id,
            'driver_id' => $vehicle_rental->driver_id,
            'client_name' => $vehicle_rental->client_name,
            'rental_price' => $vehicle_rental->rental_price,
            'rental_start' => $vehicle_rental->rental_start,
            'rental_end' => $vehicle_rental->rental_end,
            'departure_location' => $vehicle_rental->departure_location,
            'arrival_location' => $vehicle_rental->arrival_location,
            'status' => $vehicle_rental->status,

            'photo_before_url' => $vehicle_rental->photo_before ? asset('storage/' . $vehicle_rental->photo_before) : null,
            'photo_after_url' => $vehicle_rental->photo_after ? asset('storage/' . $vehicle_rental->photo_after) : null,
        ],
        'vehicles' => Bus::all(),
        'drivers' => Driver::all(),
    ]);
}




    /**
     * Mise à jour d'une location.
     */
   // --- update() ---
public function update(Request $request, VehicleRental $vehicleRental)
{
    $data = $request->all();

    // Convertir les inputs datetime-local en format compatible Laravel
    if(isset($data['rental_start'])) {
        $data['rental_start'] = str_replace('T', ' ', $data['rental_start']);
    }
    if(isset($data['rental_end'])) {
        $data['rental_end'] = str_replace('T', ' ', $data['rental_end']);
    }

    // Validation
    $validated = $request->validate([
        'vehicle_id' => 'required|exists:buses,id',
        'driver_id'  => 'required|exists:drivers,id',
        'client_name' => 'required|string|max:255',
        'rental_price' => 'required|numeric|min:0',
        'rental_start' => 'required|date',
        'rental_end' => 'required|date|after:rental_start',
        'departure_location' => 'required|string|max:255',
        'arrival_location' => 'required|string|max:255',
        'status' => 'required|in:active,completed,cancelled',
        'photo_before' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        'photo_after' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    // Gestion des fichiers
    if ($request->hasFile('photo_before')) {
        $validated['photo_before'] = $request->file('photo_before')->store('rentals', 'public');
    }

    if ($request->hasFile('photo_after')) {
        $validated['photo_after'] = $request->file('photo_after')->store('rentals', 'public');
    }

    // Vérifier conflit avec une autre location
    $conflict = VehicleRental::where('vehicle_id', $validated['vehicle_id'])
        ->where('status', 'active')
        ->where('id', '<>', $vehicleRental->id)
        ->where(function ($q) use ($validated) {
            $q->whereBetween('rental_start', [$validated['rental_start'], $validated['rental_end']])
              ->orWhereBetween('rental_end', [$validated['rental_start'], $validated['rental_end']]);
        })
        ->exists();

    if ($conflict) {
        return redirect()->back()->with('error', 'Le véhicule est déjà loué sur cette période.');
    }

    $vehicleRental->update($validated);

    return redirect()->route('vehicle-rentals.index')
                     ->with('success', 'Location mise à jour avec succès.');
}


    /**
     * Supprimer une location.
     */
    public function destroy(VehicleRental $vehicleRental)
    {
        $vehicleRental->delete();

        return redirect()->route('vehicle-rentals.index')
                         ->with('success', 'Location supprimée avec succès.');
    }

    /**
     * Prolonger une location.
     */
    public function extend(Request $request, VehicleRental $vehicleRental)
    {
        $request->validate([
            'new_end' => 'required|date|after:' . $vehicleRental->rental_end,
        ]);

        $newEndDate = $request->new_end;

        // Vérifier conflit avec une location suivante
        $conflict = VehicleRental::where('vehicle_id', $vehicleRental->vehicle_id)
            ->where('status', 'active')
            ->where('id', '<>', $vehicleRental->id)
            ->where('rental_start', '<=', $newEndDate)
            ->where('rental_start', '>', $vehicleRental->rental_end)
            ->exists();

        if ($conflict) {
            return redirect()->back()->with('error', 'Impossible de prolonger : conflit avec une location suivante.');
        }

        $vehicleRental->rental_end = $newEndDate;
        $vehicleRental->save();

        return redirect()->back()->with('success', 'Durée de location prolongée avec succès.');
    }

/**
 * Enregistrer la prolongation
 */
public function storeExtension(Request $request, VehicleRental $vehicleRental)
{
    $data = $request->validate([
        'rental_end' => 'required|date|after:' . $vehicleRental->rental_end,
        'photo_after' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
    ]);

    // Vérifier conflit avec une autre location
    $conflict = VehicleRental::where('vehicle_id', $vehicleRental->vehicle_id)
        ->where('status', 'active')
        ->where('id', '<>', $vehicleRental->id)
        ->where(function ($q) use ($vehicleRental, $data) {
            $q->whereBetween('rental_start', [$vehicleRental->rental_end, $data['rental_end']])
              ->orWhereBetween('rental_end', [$vehicleRental->rental_end, $data['rental_end']]);
        })->exists();

    if ($conflict) {
        return redirect()->back()->with('error', 'Le véhicule est déjà loué sur cette période prolongée.');
    }

    $vehicleRental->rental_end = $data['rental_end'];

    // Upload photo après prolongation
    if ($request->hasFile('photo_after')) {
        $vehicleRental->photo_after = $request->file('photo_after')->store('rentals', 'public');
    }

    $vehicleRental->save();

    return redirect()->route('vehicle-rentals.index')
                     ->with('success', 'Location prolongée avec succès.');
}

public function totalByType($rentalId)
{
    $totals = VehicleRentalExpense::where('vehicle_rental_id', $rentalId)
        ->selectRaw('type, SUM(amount) as total')
        ->groupBy('type')
        ->get();

    return response()->json($totals);
}


public function show($id)
{
    $rental = VehicleRental::with(['bus', 'expenses'])->findOrFail($id);

    return Inertia::render('VehicleRentals/show', [
        'rental' => [
            'id' => $rental->id,
            'vehicle_name' => $rental->bus->registration_number ?? '-',
            'customer_name' => $rental->client_name ?? '-',
            'departure_location' => $rental->departure_location ?? '-',
            'arrival_location' => $rental->arrival_location ?? '-',

            // ⛔ garde les vraies dates pour React
            'rental_start' => $rental->rental_start,
            'rental_end' => $rental->rental_end,

            'status' => $rental->status,

            // ✅ LES DÉPENSES
            'expenses' => $rental->expenses->map(function ($expense) {
                return [
                    'id' => $expense->id,
                    'type' => $expense->type,
                    'amount' => $expense->amount,
                    'description' => $expense->description,
                ];
            }),
        ],
    ]);
}




}
