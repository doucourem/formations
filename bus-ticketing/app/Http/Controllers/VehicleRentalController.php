<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\VehicleRental;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VehicleRentalController extends Controller
{
    /**
     * Liste des locations.
     */
   public function index(Request $request)
{
    $rentals = VehicleRental::with('bus')
        ->latest()
        ->paginate(15) // ← paginate au lieu de get()
        ->withQueryString(); // conserve la recherche et filtres

    return Inertia::render('VehicleRentals/Index', [
        'rentals' => $rentals
    ]);
}



    
    /**
     * Formulaire de création.
     */
    public function create()
    {
        $vehicles = Bus::all();

        return inertia('VehicleRentals/Create', [
            'vehicles' => $vehicles,
        ]);
    }

    /**
     * Enregistrer une location.
     */
    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle_id' => 'required|exists:buses,id',
            'client_name' => 'required|string|max:255',
            'rental_price' => 'required|numeric|min:0',
            'rental_start' => 'required|date',
            'rental_end' => 'required|date|after:rental_start',
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

    /**
     * Formulaire d'édition.
     */
    public function edit(VehicleRental $vehicleRental)
    {
        $vehicles = Bus::all();

        return inertia('VehicleRentals/Edit', [
            'rental' => $vehicleRental,
            'vehicles' => $vehicles,
        ]);
    }

    /**
     * Mise à jour d'une location.
     */
    public function update(Request $request, VehicleRental $vehicleRental)
    {
        $data = $request->validate([
            'vehicle_id' => 'required|exists:buses,id',
            'client_name' => 'required|string|max:255',
            'rental_price' => 'required|numeric|min:0',
            'rental_start' => 'required|date',
            'rental_end' => 'required|date|after:rental_start',
            'status' => 'required|in:active,completed,cancelled',
        ]);

        // Vérifier conflit avec une autre location
        $conflict = VehicleRental::where('vehicle_id', $data['vehicle_id'])
            ->where('status', 'active')
            ->where('id', '<>', $vehicleRental->id)
            ->where(function ($q) use ($data) {
                $q->whereBetween('rental_start', [$data['rental_start'], $data['rental_end']])
                  ->orWhereBetween('rental_end', [$data['rental_start'], $data['rental_end']]);
            })
            ->exists();

        if ($conflict) {
            return redirect()->back()->with('error', 'Le véhicule est déjà loué sur cette période.');
        }

        $vehicleRental->update($data);

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

}
