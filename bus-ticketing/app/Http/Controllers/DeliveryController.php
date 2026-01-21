<?php

namespace App\Http\Controllers;

use App\Models\Delivery;
use App\Models\DeliveryLog;
use App\Models\Bus;
use App\Models\Driver;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DeliveryController extends Controller
{
    public function index(Request $request)
    {
        $deliveries = Delivery::with(['bus','driver','logs','expenses'])
            ->latest()
            ->paginate(15)
            ->withQueryString();


        return Inertia::render('Delivery/DeliveryIndex', compact('deliveries'));
    }

    public function create()
    {
        $vehicles = Bus::all();
        $drivers = Driver::all();

        return Inertia::render('Delivery/Create', compact('vehicles','drivers'));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'vehicle_id' => ['required', 'exists:'.(new Bus)->getTable().',id'],
            'driver_id' => 'required|exists:drivers,id',

            'client_name' => 'required|string|max:255',
            'departure_place' => 'required|string|max:255',
            'arrival_place' => 'required|string|max:255',

            'product_name' => 'required|string|max:255',
            'product_lot' => 'nullable|string|max:255',

            'quantity_loaded' => 'required|numeric|min:0.1',
            'distance_km' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',

            'departure_at' => 'required|date',
            'arrival_at' => 'nullable|date|after:departure_at',
        ]);

        

        $delivery = Delivery::create($data);

        DeliveryLog::create([
            'delivery_id' => $delivery->id,
            'action' => 'chargement',
            'quantity' => $delivery->quantity_loaded,
            'location' => $delivery->departure_place,
        ]);

        return redirect()->route('deliveries.index')
            ->with('success', 'Livraison créée avec succès.');
    }

    public function show(Delivery $delivery)
    {
        $delivery->load('bus','driver','logs');

        return Inertia::render('Delivery/DeliveryShow', compact('delivery'));
    }

    public function edit(Delivery $delivery)
    {
        $buses = Bus::all();
        $drivers = Driver::all();

        return Inertia::render('Delivery/DeliveryEdit', compact('delivery','buses','drivers'));
    }

    public function update(Request $request, Delivery $delivery)
    {
        $data = $request->validate([
            'vehicle_id' => ['required', 'exists:'.(new Bus)->getTable().',id'],
            'driver_id' => 'required|exists:drivers,id',

            'client_name' => 'required|string|max:255',
            'departure_place' => 'required|string|max:255',
            'arrival_place' => 'required|string|max:255',

            'product_name' => 'required|string|max:255',
            'product_lot' => 'nullable|string|max:255',

            'quantity_loaded' => 'required|numeric|min:0.1',
            'quantity_delivered' => 'nullable|numeric|min:0',

            'distance_km' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',

            'departure_at' => 'required|date',
            'arrival_at' => 'nullable|date|after:departure_at',

            'status' => 'required|in:pending,in_transit,delivered',
        ]);

        $delivery->update($data);

        return redirect()->route('deliveries.index')
            ->with('success', 'Livraison mise à jour.');
    }

    public function destroy(Delivery $delivery)
    {
        $delivery->delete();

        return redirect()->route('deliveries.index')
            ->with('success', 'Livraison supprimée.');
    }

    public function addLog(Request $request, Delivery $delivery)
    {
        $data = $request->validate([
            'action' => 'required|in:chargement,depart,livraison,incident',
            'quantity' => 'nullable|numeric|min:0',
            'location' => 'nullable|string|max:255',
        ]);

        DeliveryLog::create([
            'delivery_id' => $delivery->id,
            'action' => $data['action'],
            'quantity' => $data['quantity'] ?? null,
            'location' => $data['location'] ?? null,
        ]);

        $delivery->updateStatus();

        return redirect()->back()
            ->with('success', 'Log ajouté et statut mis à jour.');
    }
}
