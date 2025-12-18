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
    // Liste des livraisons
    public function index()
    {
        $deliveries = Delivery::with(['bus','driver','logs'])->latest()->get();
        return Inertia::render('Delivery/DeliveryIndex', compact('deliveries'));
    }

    // Formulaire création
    public function create()
    {
        $vehicles = Bus::all();
        $drivers = Driver::all();
        return Inertia::render('Delivery/Create', compact('vehicles','drivers'));
    }

    // Enregistrer une livraison
  public function store(Request $request)
{
    $data = $request->validate([
        'vehicle_id' => ['required', 'exists:'.(new Bus)->getTable().',id'],
        'driver_id' => 'required|exists:drivers,id',
        'product_name' => 'required|string',
        'product_lot' => 'nullable|string',
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
        'location' => 'Départ',
    ]);

    return redirect()->route('deliveries.index')->with('success', 'Livraison créée avec succès.');
}


    // Afficher une livraison
    public function show(Delivery $delivery)
    {
        $delivery->load('bus','driver','logs');
        return Inertia::render('Delivery/DeliveryShow', compact('delivery'));
    }

    // Formulaire édition
    public function edit(Delivery $delivery)
    {
        $buses = Bus::all();
        $drivers = Driver::all();
        return Inertia::render('Delivery/DeliveryEdit', compact('delivery','buses','drivers'));
    }

    // Mise à jour
    public function update(Request $request, Delivery $delivery)
    {
        $data = $request->validate([
            'vehicle_id' => 'required|exists:vehicles,id',
            'driver_id' => 'required|exists:drivers,id',
            'product_name' => 'required|string',
            'product_lot' => 'nullable|string',
            'quantity_loaded' => 'required|numeric|min:0.1',
            'distance_km' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'departure_at' => 'required|date',
            'arrival_at' => 'nullable|date|after:departure_at',
            'status' => 'required|in:pending,in_transit,delivered',
        ]);

        $delivery->update($data);

        return redirect()->route('deliveries.index')->with('success', 'Livraison mise à jour.');
    }

    // Supprimer une livraison
    public function destroy(Delivery $delivery)
    {
        $delivery->delete();
        return redirect()->route('deliveries.index')->with('success', 'Livraison supprimée.');
    }

    // Ajouter un log (chargement, départ, livraison)
    public function addLog(Request $request, Delivery $delivery)
    {
        $data = $request->validate([
            'action' => 'required|in:chargement,depart,livraison,incident',
            'quantity' => 'nullable|numeric|min:0',
            'location' => 'nullable|string',
        ]);

        DeliveryLog::create([
            'delivery_id' => $delivery->id,
            'action' => $data['action'],
            'quantity' => $data['quantity'] ?? null,
            'location' => $data['location'] ?? null,
        ]);

        // Mettre à jour le statut automatiquement
        $delivery->updateStatus();

        return redirect()->back()->with('success', 'Log ajouté et statut mis à jour.');
    }
}
