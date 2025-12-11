<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\DriverDocument;
use App\Models\DriverAssignment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DriverController extends Controller
{
    public function index() {
        $drivers = Driver::with('documents', 'assignments')->get();
        return inertia('Drivers/Index', [
            'drivers' => ['data' => $drivers]
        ]);
    }

    public function create() {
        return inertia('Drivers/Create');
    }

  public function store(Request $request)
{
    $validated = $request->validate([
        'first_name' => 'required|string|max:255',
        'last_name'  => 'required|string|max:255',
        'phone'      => 'required|string|max:20',
        'email'      => 'nullable|email',
        'birth_date' => 'nullable|date',
        'address'    => 'nullable|string',
        'photo'      => 'nullable|image|max:2048',
    ]);

    if ($request->hasFile('photo')) {
        $validated['photo'] = $request->file('photo')->store('drivers', 'public');
    }

    Driver::create($validated);

    return back()->with('success', true);
}


    public function edit(Driver $driver) {
        return inertia('Drivers/Edit', ['driver'=>$driver]);
    }

public function update(Request $request, Driver $driver)
{
    $data = $request->validate([
        'first_name'   => 'required|string|max:255',
        'last_name'    => 'required|string|max:255',
        'birth_date'   => 'nullable|date',
        'phone'        => 'nullable|string|max:20',
        'email'        => 'nullable|email|max:255',
        'address'      => 'nullable|string|max:500',
        'photo'        => 'nullable|image|max:2048',
        'remove_photo' => 'nullable|boolean',
    ]);

    // Supprimer la photo si demandé
    if ($request->boolean('remove_photo') && $driver->photo) {
        \Storage::disk('public')->delete($driver->photo);
        $data['photo'] = null;
    }

    // Upload nouvelle photo
    if ($request->hasFile('photo')) {
        if ($driver->photo) {
            \Storage::disk('public')->delete($driver->photo);
        }
        $data['photo'] = $request->file('photo')->store('drivers', 'public');
    }

    dd($data);
    exit;
    $driver->update($data);

    return redirect()->route('drivers.edit', $driver->id)
                     ->with('success', 'Chauffeur mis à jour avec succès !');
}




    public function destroy(Driver $driver) {
        $driver->delete();
        return redirect()->route('drivers.index');
    }

    // Upload document
    public function uploadDocument(Request $request, Driver $driver){
        $request->validate([
            'type'=>'required',
            'number'=>'nullable',
            'expiry_date'=>'nullable|date',
            'file'=>'required|file|mimes:pdf,jpg,png'
        ]);

        $path = $request->file('file')->store('driver_docs','public');
        $driver->documents()->create([
            'type'=>$request->type,
            'number'=>$request->number,
            'expiry_date'=>$request->expiry_date,
            'file_path'=>$path
        ]);

        return back();
    }

    // Delete document
    public function destroyDocument(Driver $driver, DriverDocument $document){
        Storage::disk('public')->delete($document->file_path);
        $document->delete();
        return back();
    }

    // Affecter bus/trip
    public function assignBusOrTrip(Request $request, Driver $driver){
        $request->validate([
            'bus_id'=>'nullable|exists:buses,id',
            'trip_id'=>'nullable|exists:trips,id',
            'start_time'=>'nullable|date',
            'end_time'=>'nullable|date'
        ]);

        DriverAssignment::create(array_merge($request->all(), ['driver_id'=>$driver->id]));
        return back();
    }

    // Delete assignment
    public function destroyAssignment(Driver $driver, DriverAssignment $assignment){
        $assignment->delete();
        return back();
    }

    // Show Driver Details for Inertia
    public function show1(Driver $driver){
        $driver->load(['documents', 'assignments.bus', 'assignments.trip.route.departureCity', 'assignments.trip.route.arrivalCity']);
        $buses = \App\Models\Bus::all();
        $trips = \App\Models\Trip::with('route.departureCity','route.arrivalCity')->get();

        return inertia('Drivers/DriverDetails', [
            'driver' => $driver,
            'buses' => $buses,
            'trips' => $trips
        ]);
    }

    public function show(Driver $driver)
{
    $driver->load('documents'); // relation déjà définie dans ton modèle

    return inertia('Drivers/Show', [
        'driver' => [
            'id' => $driver->id,
            'first_name' => $driver->first_name,
            'last_name' => $driver->last_name,
            'phone' => $driver->phone,
            'email' => $driver->email,
            'birth_date' => $driver->birth_date,
            'address' => $driver->address,
            'photo' => $driver->photo ? asset('storage/'.$driver->photo) : null,

            'documents' => $driver->documents->map(fn($doc) => [
                'id' => $doc->id,
                'type' => $doc->type,
                'file_path' => asset('storage/'.$doc->file_path),
                'expires_at' => $doc->expires_at,
            ]),
        ]
    ]);
}

}
