<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use App\Models\Trip;
use App\Models\Agency;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ParcelController extends Controller
{
    /* ============================
     | LISTE DES COLIS
     ============================ */
    public function index()
    {
        $user = auth()->user();

        $query = Parcel::with(['departureAgency', 'arrivalAgency', 'trip.route']);

        if (!in_array($user->role, ['admin', 'super_admin'])) {
            $query->where(function ($q) use ($user) {
                $q->where('departure_agency_id', $user->agency_id)
                  ->orWhere('arrival_agency_id', $user->agency_id);
            });
        }

        return Inertia::render('Parcels/Index', [
            'parcels' => $query->orderByDesc('created_at')
                               ->paginate(20)
                               ->withQueryString()
        ]);
    }

    /* ============================
     | FORM CREATE
     ============================ */
    public function create()
    {
        Carbon::setLocale('fr');

        return Inertia::render('Parcels/Create', [
            'trips' => $this->getTrips(),
            'agencies' => Agency::select('id', 'name')->get(),
        ]);
    }

    /* ============================
     | FORM EDIT
     ============================ */
    public function edit(Parcel $parcel)
    {
        Carbon::setLocale('fr');

        return Inertia::render('Parcels/Edit', [
            'parcel' => $parcel,
            'trips' => $this->getTrips(),
            'agencies' => Agency::select('id', 'name')->get(),
        ]);
    }

    /* ============================
     | STORE
     ============================ */
    public function store(Request $request)
    {
        $validated = $this->validateParcel($request);

        if ($request->hasFile('parcel_image')) {
            $validated['parcel_image'] =
                Storage::disk('public_web')->put('parcels', $request->file('parcel_image'));
        }

        Parcel::create($validated);

        return redirect()->route('parcels.index')
            ->with('success', 'Colis créé avec succès.');
    }

    /* ============================
     | UPDATE
     ============================ */
    public function update(Request $request, Parcel $parcel)
    {
        $validated = $this->validateParcel($request, $parcel->id);

        if ($request->hasFile('parcel_image')) {
            if ($parcel->parcel_image) {
                Storage::disk('public_web')->delete($parcel->parcel_image);
            }

            $validated['parcel_image'] =
                Storage::disk('public_web')->put('parcels', $request->file('parcel_image'));
        }

        $parcel->update($validated);

        return redirect()->route('parcels.index')
            ->with('success', 'Colis mis à jour avec succès.');
    }

    /* ============================
     | DELETE
     ============================ */
    public function destroy(Parcel $parcel)
    {
        if ($parcel->parcel_image) {
            Storage::disk('public_web')->delete($parcel->parcel_image);
        }

        $parcel->delete();

        return back()->with('success', 'Colis supprimé.');
    }

    /* ============================
     | SHOW
     ============================ */
       public function show(Parcel $parcel)
{
    $parcel->load([
        'trip.route.departureCity',
        'trip.route.arrivalCity',
        'trip.bus',
        'departureAgency',
        'arrivalAgency',
    ]);

    return Inertia::render('Parcels/Show', [
        'parcel' => [
            'id' => $parcel->id,
            'tracking_number' => $parcel->tracking_number,

            'sender_name' => $parcel->sender_name,
            'sender_phone' => $parcel->sender_phone,
            'recipient_name' => $parcel->recipient_name,
            'recipient_phone' => $parcel->recipient_phone,

            'weight_kg' => $parcel->weight_kg,
            'price' => (float) $parcel->price,
            'merchandise_value' => (float) $parcel->merchandise_value,

            'status' => $parcel->status,
            'description' => $parcel->description,

            'parcel_image' => $parcel->parcel_image
                ? Storage::disk('public_web')->url($parcel->parcel_image)
                : null,

            /* =========================
               AGENCES (JAMAIS NULL)
            ========================= */
            'senderAgency' => [
                'id'   => $parcel->departureAgency->id ?? null,
                'name' => $parcel->departureAgency->name ?? 'Agence non définie',
            ],

            'recipientAgency' => [
                'id'   => $parcel->arrivalAgency->id ?? null,
                'name' => $parcel->arrivalAgency->name ?? 'Agence non définie',
            ],

            /* =========================
               VOYAGE
            ========================= */
            'trip' => $parcel->trip ? [
                'departureCity' => $parcel->trip->route->departureCity->name ?? null,
                'arrivalCity'   => $parcel->trip->route->arrivalCity->name ?? null,
                'departure_at'  => optional($parcel->trip->departure_at)->format('d/m/Y H:i'),
                'bus'           => $parcel->trip->bus->registration_number ?? null,
            ] : null,
        ],
    ]);
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
                ? Carbon::parse($trip->departure_at)->format('d/m/Y H:i')
                : null,
            'arrival_time' => $trip->arrival_at
                ? Carbon::parse($trip->arrival_at)->format('d/m/Y H:i')
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

    /* ============================
     | EXPORT EXCEL
     ============================ */
    public function exportSummary()
    {
        $parcels = Parcel::with('trip')->latest()->get();

        $sheet = (new Spreadsheet())->getActiveSheet();
        $sheet->fromArray([
            ['ID', 'Tracking', 'Expéditeur', 'Destinataire', 'Poids (kg)', 'Prix', 'Statut', 'Date']
        ], null, 'A1');

        $row = 2;
        foreach ($parcels as $p) {
            $sheet->fromArray([
                $p->id,
                $p->tracking_number,
                $p->sender_name,
                $p->recipient_name,
                $p->weight_kg,
                $p->price,
                ucfirst($p->status),
                $p->created_at->format('d/m/Y H:i'),
            ], null, "A$row");
            $row++;
        }

        return $this->downloadExcel($sheet, 'parcels_summary');
    }

    /* ============================
     | HELPERS
     ============================ */
    private function getTrips()
    {
        return Trip::with(['route.departureCity', 'route.arrivalCity', 'bus'])
            ->get()
            ->map(fn ($t) => [
                'id' => $t->id,
                'departure_at' => Carbon::parse($t->departure_at)
                    ->translatedFormat('l d F Y H:i'),
                'route' => [
                    'departureCity' => $t->route?->departureCity?->name,
                    'arrivalCity' => $t->route?->arrivalCity?->name,
                ],
            ]);
    }

    private function validateParcel(Request $request, $id = null)
    {
        return $request->validate([
            'trip_id' => 'nullable|exists:trips,id',
            'tracking_number' => 'required|string|unique:parcels,tracking_number,' . $id,
            'sender_name' => 'required|string',
            'sender_phone' => 'required|string',
            'recipient_name' => 'required|string',
            'recipient_phone' => 'required|string',
            'weight_kg' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
            'merchandise_value'=> 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|string',
            'parcel_image' => 'nullable|image|mimes:jpg,jpeg,png|max:20480',
            'departure_agency_id' => 'required|exists:agencies,id',
            'arrival_agency_id' => 'required|exists:agencies,id',
        ]);
    }

    private function downloadExcel($sheet, $name)
    {
        $writer = new Xlsx($sheet->getParent());
        $filename = $name . '_' . now()->format('Ymd_His') . '.xlsx';

        return response()->stream(
            fn () => $writer->save('php://output'),
            200,
            [
                'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition' => "attachment; filename=\"$filename\"",
            ]
        );
    }
}
