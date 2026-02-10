<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\DriverDocument;
use App\Models\DriverAssignment;
use App\Models\Bus;
use App\Models\Trip;
use App\Models\Companies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class DriverController extends Controller
{
    /**
     * Liste des chauffeurs
     */
    public function index() {
        $drivers = Driver::with(['documents', 'assignments', 'company'])->get();

        return inertia('Drivers/Index', [
            'drivers' => ['data' => $drivers]
        ]);
    }

    /**
     * Formulaire création
     */
    public function create() {
        $companies = Companies::select('id','name')->orderBy('name')->get();
        return inertia('Drivers/Create', ['companies' => $companies]);
    }

    /**
     * Stocker un chauffeur
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'first_name' => 'required|string|max:255',
            'last_name'  => 'required|string|max:255',
            'phone'      => 'required|string|max:20',
            'email'      => 'nullable|email|max:255',
            'birth_date' => 'nullable|date',
            'address'    => 'nullable|string|max:500',
            'photo'      => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'company_id' => 'required|exists:companies,id',
        ]);

        // Upload photo via public_web
        if ($request->hasFile('photo')) {
            $validated['photo'] = Storage::disk('public_web')
                ->putFile('drivers', $request->file('photo'));
        }

        Driver::create($validated);

        return back()->with('success', true);
    }

    /**
     * Formulaire édition
     */
    public function edit(Driver $driver) {
    $companies = Companies::select('id','name')->orderBy('name')->get();

    // URL publique pour la photo
    $driver->photo_url = $driver->photo
        ? Storage::disk('public_web')->url($driver->photo)
        : null;

    // URL publique pour chaque document
    $driver->documents->transform(function ($doc) {
        $doc->file_url = $doc->file_path
            ? Storage::disk('public_web')->url($doc->file_path)
            : null;
        return $doc;
    });

    return inertia('Drivers/Edit', [
        'driver' => $driver,
        'companies' => $companies,
    ]);
}


    /**
     * Mettre à jour un chauffeur
     */
    public function update(Request $request, Driver $driver)
    {
        $data = $request->validate([
            'first_name'   => 'required|string|max:255',
            'last_name'    => 'required|string|max:255',
            'birth_date'   => 'nullable|date',
            'phone'        => 'nullable|string|max:20',
            'email'        => 'nullable|email|max:255',
            'address'      => 'nullable|string|max:500',
            'photo'        => 'nullable|image|mimes:jpg,jpeg,png|max:2048',
            'remove_photo' => 'nullable|boolean',
            'company_id'   => 'required|exists:companies,id',
        ]);

        // Supprimer photo si demandé
        if ($request->boolean('remove_photo') && $driver->photo) {
            Storage::disk('public_web')->delete($driver->photo);
            $data['photo'] = null;
        }

        // Upload nouvelle photo
        if ($request->hasFile('photo')) {
            if ($driver->photo) {
                Storage::disk('public_web')->delete($driver->photo);
            }
            $data['photo'] = Storage::disk('public_web')
                ->putFile('drivers', $request->file('photo'));
        }

        $driver->update($data);

        return back()->with('success', true);
    }

    /**
     * Supprimer un chauffeur
     */
    public function destroy(Driver $driver) {
        // supprimer photo
        if ($driver->photo) {
            Storage::disk('public_web')->delete($driver->photo);
        }

        // supprimer tous les documents
        foreach ($driver->documents as $doc) {
            Storage::disk('public_web')->delete($doc->file_path);
            $doc->delete();
        }

        $driver->delete();

        return redirect()->route('drivers.index');
    }

    /**
     * Upload document
     */
    public function uploadDocument(Request $request, Driver $driver){
        $request->validate([
            'type'=>'required|string',
            'number'=>'nullable|string|max:255',
            'expiry_date'=>'nullable|date',
            'file'=>'required|file|mimes:pdf,jpg,png|max:5120' // 5MB max
        ]);

        $path = Storage::disk('public_web')
            ->putFile('driver_docs', $request->file('file'));

        $driver->documents()->create([
            'type'      => $request->type,
            'number'    => $request->number,
            'expiry_date'=> $request->expiry_date,
            'file_path' => $path
        ]);

        return back();
    }

    /**
     * Supprimer document
     */
    public function destroyDocument(Driver $driver, DriverDocument $document){
        Storage::disk('public_web')->delete($document->file_path);
        $document->delete();
        return back();
    }

    /**
     * Affecter bus ou trajet
     */
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

    /**
     * Supprimer affectation
     */
    public function destroyAssignment(Driver $driver, DriverAssignment $assignment){
        $assignment->delete();
        return back();
    }

    /**
     * Afficher détails chauffeur (documents, assignations, compagnie)
     */
  public function show(Driver $driver){
    $driver->load([
        'documents',
        'assignments.bus',
        'assignments.trip.route.departureCity',
        'assignments.trip.route.arrivalCity',
        'company'
    ]);

    // URL publique pour la photo du chauffeur
    $driver->photo_url = $driver->photo
        ? Storage::disk('public_web')->url($driver->photo)
        : null;

    // URL publique pour chaque document
    $driver->documents->transform(function ($doc) {
        $doc->file_url = $doc->file_path
            ? Storage::disk('public_web')->url($doc->file_path)
            : null;
        return $doc;
    });

    $buses = Bus::all();
    $trips = Trip::with('route.departureCity','route.arrivalCity')->get();

    return inertia('Drivers/Show', [
        'driver' => $driver,
        'buses' => $buses,
        'trips' => $trips,
    ]);
}

}