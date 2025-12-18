<?php

namespace App\Http\Controllers;

use App\Models\Companies;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Bus;
use App\Models\Agency;
use App\Models\Trip;
class BusController extends Controller
{
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $agencyId = $request->input('agency_id');

        $buses = Bus::with('agency')
            ->when($agencyId, fn($q) => $q->where('agency_id', $agencyId))
            ->orderBy('model')
            ->paginate($perPage)
            ->withQueryString()
            ->through(fn($bus) => [
                'id' => $bus->id,
                'registration_number' => $bus->registration_number,
                'model' => $bus->model,
                'capacity' => $bus->capacity,
                'status' => $bus->status,
                'agency' => $bus->agency?->name ?? '-',
                'created_at' => $bus->created_at?->toDateTimeString() ?? '',
                'updated_at' => $bus->updated_at?->toDateTimeString() ?? '',
            ]);

        return Inertia::render('Buses/Index', [
            'buses' => $buses,
            'filters' => [
                'agency_id' => $agencyId,
                'per_page' => $perPage,
            ],
        ]);
    }
    

    public function create()
    {
        $agencies = Agency::select('id', 'name')->get();
         $companies = Companies::select('id', 'name')->get();
    
        return Inertia::render('Buses/Create', [
            'agencies' => $agencies,
            'companies' => $companies,
        ]);
    }
    
    public function edit(Bus $bus)
{
    $bus->load('agency');
     $bus->load('company');

    $agencies = Agency::select('id', 'name')->get();
    $companies = Companies::select('id', 'name')->get();

    return Inertia::render('Buses/Edit', [
        'bus' => [
            'id' => $bus->id,
            'vehicle_type' => $bus->vehicle_type ?? 'bus',
            'registration_number' => $bus->registration_number,
            'model' => $bus->model,
            'capacity' => $bus->capacity,
            'max_load' => $bus->max_load,
            'tank_capacity' => $bus->tank_capacity,
            'product_type' => $bus->product_type,
            'compartments' => $bus->compartments ?? 1,
            'tank_material' => $bus->tank_material,
            'pump_type' => $bus->pump_type,
            'adr_certified' => $bus->adr_certified,
            'fire_extinguisher' => $bus->fire_extinguisher,
            'last_inspection_date' => $bus->last_inspection_date,
            'next_inspection_date' => $bus->next_inspection_date,
            'status' => $bus->status,
            'agency_id' => $bus->agency_id,
            'agency' => $bus->agency?->name ?? '',
            'company_id' => $bus->company_id,
        ],
        'agencies' => $agencies,
        'companies' => $companies,
    ]);
}

    
    /**
     * Store a newly created bus in storage.
     */
public function store(Request $request)
{
    $validator = \Validator::make($request->all(), [
        'vehicle_type' => 'required|in:bus,truck,tanker',
        'registration_number' => 'required|unique:buses',
        'company_id' => 'required|exists:companies,id',
        'model' => 'required|string|max:255',
        'capacity' => 'nullable|integer|min:1',   // Bus
        'max_load' => 'nullable|numeric|min:0',   // Truck
        'tank_capacity' => 'nullable|numeric|min:0', // Tanker
        'product_type' => 'nullable|string',      // Tanker
        'compartments' => 'nullable|integer|min:1',
        'tank_material' => 'nullable|string',
        'pump_type' => 'nullable|string',
        'adr_certified' => 'nullable|boolean',
        'fire_extinguisher' => 'nullable|boolean',
        'last_inspection_date' => 'nullable|date',
        'next_inspection_date' => 'nullable|date',
        'status' => 'required|in:active,inactive,maintenance',
        'agency_id' => 'nullable|exists:agencies,id',
    ]);

    // Validation conditionnelle selon le type de véhicule
    $validator->sometimes('capacity', 'required|integer|min:1', function ($input) {
        return $input->vehicle_type === 'bus';
    });
    $validator->sometimes('max_load', 'required|numeric|min:0', function ($input) {
        return $input->vehicle_type === 'truck';
    });
    $validator->sometimes(['tank_capacity', 'product_type'], 'required', function ($input) {
        return $input->vehicle_type === 'tanker';
    });
    $validator->sometimes('next_inspection_date', 'after_or_equal:last_inspection_date', function ($input) {
        return !empty($input->last_inspection_date) && !empty($input->next_inspection_date);
    });

    if ($validator->fails()) {
    
        return redirect()->back()
            ->withErrors($validator)
            ->withInput();
    }

    Bus::create($validator->validated());

    return redirect()->route('buses.index')
        ->with('success', 'Véhicule créé avec succès');
}




    /**
     * Update the specified bus in storage.
     */
  public function update(Request $request, Bus $bus)
{
    $validator = \Validator::make($request->all(), [
        'vehicle_type' => 'required|in:bus,truck,tanker',
        'company_id' => 'required|exists:companies,id',
        'registration_number' => 'required|unique:buses,registration_number,' . $bus->id,
        'model' => 'required|string|max:255',
        'capacity' => 'nullable|integer|min:1',   // Bus
        'max_load' => 'nullable|numeric|min:0',   // Truck
        'tank_capacity' => 'nullable|numeric|min:0', // Tanker
        'product_type' => 'nullable|string',      // Tanker
        'compartments' => 'nullable|integer|min:1',
        'tank_material' => 'nullable|string',
        'pump_type' => 'nullable|string',
        'adr_certified' => 'nullable|boolean',
        'fire_extinguisher' => 'nullable|boolean',
        'last_inspection_date' => 'nullable|date',
        'next_inspection_date' => 'nullable|date',
        'status' => 'required|in:active,inactive,maintenance',
        'agency_id' => 'nullable|exists:agencies,id',
    ]);

    // Validation conditionnelle selon le type de véhicule
    $validator->sometimes('capacity', 'required|integer|min:1', function ($input) {
        return $input->vehicle_type === 'bus';
    });
    $validator->sometimes('max_load', 'required|numeric|min:0', function ($input) {
        return $input->vehicle_type === 'truck';
    });
    $validator->sometimes(['tank_capacity', 'product_type'], 'required', function ($input) {
        return $input->vehicle_type === 'tanker';
    });
    $validator->sometimes('next_inspection_date', 'after_or_equal:last_inspection_date', function ($input) {
        return !empty($input->last_inspection_date) && !empty($input->next_inspection_date);
    });

    if ($validator->fails()) {
        return redirect()->back()
            ->withErrors($validator)
            ->withInput();
    }

    $bus->update($validator->validated());

    return redirect()->route('buses.index')
        ->with('success', 'Véhicule modifié avec succès');
}

    /**
     * Optionnel : suppression d’un bus
     */
    public function destroy(Bus $bus)
    {
        $bus->delete();

        return redirect()
            ->route('buses.index')
            ->with('success', 'Bus supprimé avec succès.');
    }


public function byBus(Bus $bus)
{
    $trips = Trip::with(['route.departureCity', 'route.arrivalCity', 'bus'])
        ->where('bus_id', $bus->id)
        ->withCount(['tickets as tickets_total' => function ($query) {
            $query->select(\DB::raw("COALESCE(SUM(price),0)"));
        }])
        ->orderByDesc('departure_at')
        ->paginate(10);

    return Inertia::render('Buses/TripsByBus', [
        'bus' => [
            'id' => $bus->id,
            'registration_number' => $bus->registration_number,
            'model' => $bus->model,
            'capacity' => $bus->capacity,
        ],
        'trips' => $trips->through(fn($trip) => [
            'id' => $trip->id,
            'departure_at' => $trip->departure_at ? \Carbon\Carbon::parse($trip->departure_at)->format('d/m/Y H:i') : null,
            'arrival_at' => $trip->arrival_at ? \Carbon\Carbon::parse($trip->arrival_at)->format('d/m/Y H:i') : null,
            'tickets_total' => $trip->tickets_total,
            'route' => $trip->route ? [
                'departureCity' => $trip->route->departureCity?->name ?? '-',
                'arrivalCity' => $trip->route->arrivalCity?->name ?? '-',
                'price' => $trip->route->price ?? 0,
            ] : null,
            'bus' => $trip->bus ? [
                'registration_number' => $trip->bus->registration_number,
            ] : null,
        ]),
        'filters' => request()->only(['page', 'per_page', 'sort_field', 'sort_direction']),
    ]);
}


}
