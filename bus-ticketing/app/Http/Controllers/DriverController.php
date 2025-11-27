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

    public function store(Request $request) {
        $data = $request->validate([
            'first_name'=>'required',
            'last_name'=>'required',
            'birth_date'=>'nullable|date',
            'phone'=>'nullable',
            'email'=>'nullable|email',
            'address'=>'nullable',
            'photo'=>'nullable|image|max:2048',
        ]);

        if($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('drivers', 'public');
        }

        Driver::create($data);
        return redirect()->route('drivers.index');
    }

    public function edit(Driver $driver) {
        return inertia('Drivers/Edit', ['driver'=>$driver]);
    }

    public function update(Request $request, Driver $driver) {
        $data = $request->validate([
            'first_name'=>'required',
            'last_name'=>'required',
            'birth_date'=>'nullable|date',
            'phone'=>'nullable',
            'email'=>'nullable|email',
            'address'=>'nullable',
            'photo'=>'nullable|image|max:2048',
        ]);
        if($request->hasFile('photo')) {
            $data['photo'] = $request->file('photo')->store('drivers', 'public');
        }
        $driver->update($data);
        return redirect()->route('drivers.index');
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
    public function show(Driver $driver){
        $driver->load(['documents', 'assignments.bus', 'assignments.trip.route.departureCity', 'assignments.trip.route.arrivalCity']);
        $buses = \App\Models\Bus::all();
        $trips = \App\Models\Trip::with('route.departureCity','route.arrivalCity')->get();

        return inertia('Drivers/DriverDetails', [
            'driver' => $driver,
            'buses' => $buses,
            'trips' => $trips
        ]);
    }
}
