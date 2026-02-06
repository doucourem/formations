<?php

namespace App\Http\Controllers;

use App\Models\Bus;
use App\Models\Agency;
use App\Models\Companies;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class BusController extends Controller
{
    /**
     * Liste des bus filtrée par la compagnie de l'utilisateur
     */
    public function index(Request $request)
{
    $perPage = (int) $request->input('per_page', 10);
    $agencyIdFilter = $request->input('agency_id');

    $user = auth()->user();

    // 🔹 S'assurer que la relation agence est chargée
    $user->loadMissing('agency');

    $userCompanyId = $user->agency?->company_id;

    $buses = Bus::with(['company', 'agency'])
        ->when($userCompanyId, fn($q) => $q->where('company_id', $userCompanyId))
        ->when($agencyIdFilter, fn($q) => $q->where('agency_id', $agencyIdFilter))
        ->orderBy('model')
        ->paginate($perPage)
        ->withQueryString()
        ->through(fn($bus) => [
            'id' => $bus->id,
            'registration_number' => $bus->registration_number,
            'model' => $bus->model,
            'capacity' => $bus->capacity,
            'vehicle_type' => $bus->vehicle_type,
            'status' => $bus->status,
            'company' => $bus->company?->name ?? '-',
            'agency' => $bus->agency?->name ?? '-',
            'created_at' => $bus->created_at?->toDateTimeString() ?? '',
            'updated_at' => $bus->updated_at?->toDateTimeString() ?? '',
        ]);

    return Inertia::render('Buses/Index', [
        'buses' => $buses,
        'filters' => [
            'agency_id' => $agencyIdFilter,
            'per_page' => $perPage,
        ],
    ]);
}


    /**
     * Formulaire de création de bus
     */
   public function create()
{
    $user = auth()->user();
    $user->loadMissing('agency'); // Assurez-vous que la relation agence est chargée

    $userCompanyId = $user->agency?->company_id;

    // 🔹 Agences de la même compagnie
    $agencies = Agency::when($userCompanyId, fn($q) => $q->where('company_id', $userCompanyId))
        ->select('id', 'name')
        ->get();

    // 🔹 Compagnie de l'utilisateur seulement
    $companies = Companies::when($userCompanyId, fn($q) => $q->where('id', $userCompanyId))
        ->select('id', 'name')
        ->get();

    return Inertia::render('Buses/Create', [
        'agencies' => $agencies,
        'companies' => $companies,
    ]);
}


    /**
     * Stocke un nouveau bus
     */
    public function store(Request $request)
    {
        $userCompanyId = auth()->user()->agence?->company_id;

        $validator = \Validator::make($request->all(), [
            'vehicle_type' => 'required|in:bus,truck,tanker',
            'registration_number' => 'required|unique:buses',
            'company_id' => 'required|exists:companies,id',
            'model' => 'required|string|max:255',
            'capacity' => 'nullable|integer|min:1',
            'max_load' => 'nullable|numeric|min:0',
            'tank_capacity' => 'nullable|numeric|min:0',
            'product_type' => 'nullable|string',
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
        $validator->sometimes('capacity', 'required|integer|min:1', fn($input) => $input->vehicle_type === 'bus');
        $validator->sometimes('max_load', 'required|numeric|min:0', fn($input) => $input->vehicle_type === 'truck');
        $validator->sometimes(['tank_capacity', 'product_type'], 'required', fn($input) => $input->vehicle_type === 'tanker');
        $validator->sometimes('next_inspection_date', 'after_or_equal:last_inspection_date', fn($input) => !empty($input->last_inspection_date) && !empty($input->next_inspection_date));

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

        // Forcer company_id pour les utilisateurs normaux
        if ($userCompanyId) {
            $data['company_id'] = $userCompanyId;
        }

        Bus::create($data);

        return redirect()->route('buses.index')->with('success', 'Véhicule créé avec succès');
    }

    /**
     * Formulaire d'édition d'un bus
     */
    public function edit(Bus $bus)
    {
        $userCompanyId = auth()->user()->agence?->company_id;

        if ($userCompanyId && $bus->company_id != $userCompanyId) {
            abort(403, "Vous n'avez pas accès à ce bus.");
        }

        $agencies = Agency::when($userCompanyId, fn($q) => $q->where('company_id', $userCompanyId))
            ->select('id', 'name')
            ->get();

        $companies = Companies::when(!$userCompanyId, fn($q) => $q)->select('id', 'name')->get();

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
                'company_id' => $bus->company_id,
            ],
            'agencies' => $agencies,
            'companies' => $companies,
        ]);
    }

    /**
     * Met à jour un bus existant
     */
    public function update(Request $request, Bus $bus)
    {
        $userCompanyId = auth()->user()->agence?->company_id;

        if ($userCompanyId && $bus->company_id != $userCompanyId) {
            abort(403, "Vous n'avez pas accès à ce bus.");
        }

        $validator = \Validator::make($request->all(), [
            'vehicle_type' => 'required|in:bus,truck,tanker',
            'company_id' => 'required|exists:companies,id',
            'registration_number' => 'required|unique:buses,registration_number,' . $bus->id,
            'model' => 'required|string|max:255',
            'capacity' => 'nullable|integer|min:1',
            'max_load' => 'nullable|numeric|min:0',
            'tank_capacity' => 'nullable|numeric|min:0',
            'product_type' => 'nullable|string',
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

        $validator->sometimes('capacity', 'required|integer|min:1', fn($input) => $input->vehicle_type === 'bus');
        $validator->sometimes('max_load', 'required|numeric|min:0', fn($input) => $input->vehicle_type === 'truck');
        $validator->sometimes(['tank_capacity', 'product_type'], 'required', fn($input) => $input->vehicle_type === 'tanker');
        $validator->sometimes('next_inspection_date', 'after_or_equal:last_inspection_date', fn($input) => !empty($input->last_inspection_date) && !empty($input->next_inspection_date));

        if ($validator->fails()) {
            return redirect()->back()->withErrors($validator)->withInput();
        }

        $data = $validator->validated();

        if ($userCompanyId) {
            $data['company_id'] = $userCompanyId;
        }

        $bus->update($data);

        return redirect()->route('buses.index')->with('success', 'Véhicule modifié avec succès');
    }

    /**
     * Supprime un bus
     */
    public function destroy(Bus $bus)
    {
        $userCompanyId = auth()->user()->agence?->company_id;

        if ($userCompanyId && $bus->company_id != $userCompanyId) {
            abort(403, "Vous n'avez pas accès à ce bus.");
        }

        $bus->delete();

        return redirect()->route('buses.index')->with('success', 'Bus supprimé avec succès.');
    }

    /**
     * Trips d’un bus filtrés par compagnie de l'utilisateur
     */
    public function byBus(Bus $bus)
    {
        $userCompanyId = auth()->user()->agence?->company_id;

        if ($userCompanyId && $bus->company_id != $userCompanyId) {
            abort(403, "Vous n'avez pas accès à ce bus.");
        }

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
                'departure_at' => $trip->departure_at ? Carbon::parse($trip->departure_at)->format('d/m/Y H:i') : null,
                'arrival_at' => $trip->arrival_at ? Carbon::parse($trip->arrival_at)->format('d/m/Y H:i') : null,
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
