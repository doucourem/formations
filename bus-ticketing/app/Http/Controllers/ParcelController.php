<?php

namespace App\Http\Controllers;

use App\Models\Parcel;
use App\Models\Trip; // <-- 1. Import the Trip model
use Illuminate\Http\Request;
use Carbon\Carbon;
use Inertia\Inertia;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
 use App\Models\Agency;
 use Illuminate\Support\Facades\Storage;
class ParcelController extends Controller
{
    /**
     * List all parcels
     */
public function index()
{
    $user = auth()->user();

    $query = Parcel::query();

    // Si ce n'est pas un admin, filtrer par agence
    if ($user->role !== 'admin') {
        $agencyId = $user->agency_id;
        $query->where(function($q) use ($agencyId) {
            $q->where('departure_agency_id', $agencyId)
              ->orWhere('arrival_agency_id', $agencyId);
        });
    }

    $parcels = $query->orderBy('created_at', 'desc')
                      ->paginate(20)
                      ->withQueryString(); // conserve la pagination et filtres

    return inertia('Parcels/Index', [
        'parcels' => $parcels
    ]);
}


  


public function create()
{
    Carbon::setLocale('fr');
    $today = Carbon::now();

    $trips = Trip::with([
        'route.departureCity',
        'route.arrivalCity',
        'bus',
    ])
    ->get()
    ->map(fn($t) => [
        'id' => $t->id,
        'departure_at' => Carbon::parse($t->departure_at)->translatedFormat('l d F Y H:i'),
        'bus' => [
            'capacity' => $t->bus?->capacity ?? 0,
            'model' => $t->bus?->model,
            'registration_number' => $t->bus?->registration_number,
        ],
        'route' => [
            'departureCity' => $t->route->departureCity ? ['name' => $t->route->departureCity->name] : null,
            'arrivalCity' => $t->route->arrivalCity ? ['name' => $t->route->arrivalCity->name] : null,
        ],
    ]);

    $agencies = Agency::all(['id', 'name']); // ✅ récupérer toutes les agences

    return Inertia::render('Parcels/Create', [
        'trips' => $trips,
        'agencies' => $agencies,
    ]);
}

public function edit(Parcel $parcel)
{
    Carbon::setLocale('fr');
    $today = Carbon::now();

    $trips = Trip::with([
        'route.departureCity',
        'route.arrivalCity',
        'bus',
    ])
    ->get()
    ->map(fn($t) => [
        'id' => $t->id,
        'departure_at' => Carbon::parse($t->departure_at)->translatedFormat('l d F Y H:i'),
        'bus' => [
            'capacity' => $t->bus?->capacity ?? 0,
            'model' => $t->bus?->model,
            'registration_number' => $t->bus?->registration_number,
        ],
        'route' => [
            'departureCity' => $t->route->departureCity ? ['name' => $t->route->departureCity->name] : null,
            'arrivalCity' => $t->route->arrivalCity ? ['name' => $t->route->arrivalCity->name] : null,
        ],
    ]);

    $agencies = Agency::all(['id', 'name']);

    return Inertia::render('Parcels/Edit', [
        'parcel' => $parcel,
        'trips' => $trips,
        'agencies' => $agencies,
    ]);
}



public function store(Request $request)
{
    $validated = $request->validate([
        'trip_id' => 'nullable|exists:trips,id',
        'tracking_number' => 'required|string|max:255|unique:parcels,tracking_number',
        'sender_name' => 'required|string|max:255',
        'sender_phone' => 'required|string|max:50',
        'recipient_name' => 'required|string|max:255',
        'recipient_phone' => 'required|string|max:50',
        'weight_kg' => 'required|numeric|min:0',
        'price' => 'required|numeric|min:0',
        'description' => 'nullable|string',
        'status' => 'required|string|max:100',
        'parcel_image' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        'departure_agency_id' => 'required|exists:agencies,id', // ✅ nouvelle validation
        'arrival_agency_id' => 'required|exists:agencies,id',   // ✅ nouvelle validation
    ]);

    if ($request->hasFile('parcel_image')) {
        $validated['parcel_image'] = $request->file('parcel_image')->store('parcels', 'public');
    }

    if ($request->hasFile('parcel_image')) {


    // upload dans le disque public_web
    $path = Storage::disk('public_web')->putFile(
        'parcels',
        $request->file('parcel_image')
    );

    // stocker le chemin relatif en base
    $validated['parcel_image'] = $path;
}

    Parcel::create($validated);

    return redirect()->route('parcels.index')
        ->with('success', 'Colis créé avec succès.');
}

public function update(Request $request, Parcel $parcel)
{
    $validated = $request->validate([
        'trip_id' => 'nullable|exists:trips,id',
        'tracking_number' => 'required|string|max:255|unique:parcels,tracking_number,' . $parcel->id,
        'sender_name' => 'required|string|max:255',
        'sender_phone' => 'required|string|max:50',
        'recipient_name' => 'required|string|max:255',
        'recipient_phone' => 'required|string|max:50',
        'weight_kg' => 'required|numeric|min:0',
        'price' => 'required|numeric|min:0',
        'description' => 'nullable|string',
        'status' => 'required|string|max:100',
        'parcel_image' => 'nullable|image|mimes:jpeg,jpg,png|max:2048',
        'departure_agency_id' => 'required|exists:agencies,id',
        'arrival_agency_id' => 'required|exists:agencies,id',
    ]);

    if ($request->hasFile('parcel_image')) {

    // suppression ancienne image si existante
    if (!empty($parcel->parcel_image)) {
        Storage::disk('public_web')->delete($parcel->parcel_image);
    }

    // upload dans le disque public_web
    $path = Storage::disk('public_web')->putFile(
        'parcels',
        $request->file('parcel_image')
    );

    // stocker le chemin relatif en base
    $validated['parcel_image'] = $path;
}


    $parcel->update($validated);

    return redirect()->route('parcels.index')
        ->with('success', 'Colis mis à jour avec succès.');
}




    /**
     * Delete a parcel
     */
    public function destroy(Parcel $parcel)
    {
        $parcel->delete();

        return redirect()->route('parcels.index')
            ->with('success', 'Colis supprimé avec succès.');
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
public function show(Parcel $parcel)
{
    // Charger les relations nécessaires
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
            'recipient_name' => $parcel->recipient_name,
            
            // URL publique via public_web
            'parcel_image' => $parcel->parcel_image 
                ? Storage::disk('public_web')->url($parcel->parcel_image) 
                : null,

            'senderAgency' => $parcel->departureAgency ? [
                'id' => $parcel->departureAgency->id,
                'name' => $parcel->departureAgency->name,
            ] : null,

            'recipientAgency' => $parcel->arrivalAgency ? [
                'id' => $parcel->arrivalAgency->id,
                'name' => $parcel->arrivalAgency->name,
            ] : null,

            'weight_kg' => $parcel->weight_kg,
            'price' => $parcel->price,
            'status' => $parcel->status,
            'description' => $parcel->description,

            'trip' => $parcel->trip ? [
                'id' => $parcel->trip->id,
                'departureCity' => $parcel->trip->route->departureCity?->name,
                'arrivalCity' => $parcel->trip->route->arrivalCity?->name,
                'departure_at' => $parcel->trip->departure_at
                    ? Carbon::parse($parcel->trip->departure_at)->format('d/m/Y H:i')
                    : null,
                'arrival_at' => $parcel->trip->arrival_at
                    ? Carbon::parse($parcel->trip->arrival_at)->format('d/m/Y H:i')
                    : null,
                'bus' => $parcel->trip->bus ? [
                    'registration_number' => $parcel->trip->bus->registration_number,
                ] : null,
            ] : null,
        ],
    ]);
}






    // Export résumé
    public function exportSummary()
    {
        $parcels = Parcel::with(['trip'])
            ->orderByDesc('created_at')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        // En-têtes
        $sheet->fromArray([
            ['ID', 'Trip', 'Expéditeur', 'Destinataire', 'Poids', 'Prix', 'Statut', 'Créé le']
        ], null, 'A1');

        $row = 2;

        foreach ($parcels as $parcel) {
            $sheet->setCellValue('A'.$row, $parcel->id)
                  ->setCellValue('B'.$row, $parcel->trip?->id ?? '-')
                 ->setCellValue('C'.$row, $parcel->sender_name ?? '-')
                 ->setCellValue('D'.$row, $parcel->recipient_name ?? '-')
                  ->setCellValue('E'.$row, $parcel->weight)
                  ->setCellValue('F'.$row, $parcel->price)
                  ->setCellValue('G'.$row, ucfirst($parcel->status))
                  ->setCellValue('H'.$row, optional($parcel->created_at)->format('d/m/Y H:i'));

            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'parcels_summary_' . now()->format('Ymd_His') . '.xlsx';

        ob_end_clean();

        return response()->stream(function() use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'. $filename .'"',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    // Export détaillé
    public function exportDetailed()
    {
        $parcels = Parcel::with(['trip.bus', 'trip.route.departureCity', 'trip.route.arrivalCity'])
            ->orderByDesc('created_at')
            ->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();

        $sheet->fromArray([
            ['ID', 'Trip ID', 'Bus', 'Route', 'Expéditeur', 'Destinataire', 'Poids', 'Prix', 'Statut', 'Créé le']
        ], null, 'A1');

        $row = 2;

        foreach ($parcels as $parcel) {
            $route = $parcel->trip?->route;
            $bus = $parcel->trip?->bus;

            $sheet->setCellValue('A'.$row, $parcel->id)
                  ->setCellValue('B'.$row, $parcel->trip?->id ?? '-')
                  ->setCellValue('C'.$row, $bus?->model ?? '-')
                  ->setCellValue('D'.$row, ($route?->departureCity?->name ?? '-') . ' → ' . ($route?->arrivalCity?->name ?? '-'))
                 ->setCellValue('C'.$row, $parcel->sender_name ?? '-')
                 ->setCellValue('D'.$row, $parcel->recipient_name ?? '-')
                  ->setCellValue('G'.$row, $parcel->weight)
                  ->setCellValue('H'.$row, $parcel->price)
                  ->setCellValue('I'.$row, ucfirst($parcel->status))
                  ->setCellValue('J'.$row, optional($parcel->created_at)->format('d/m/Y H:i'));

            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'parcels_detailed_' . now()->format('Ymd_His') . '.xlsx';

        ob_end_clean();

        return response()->stream(function() use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'. $filename .'"',
            'Cache-Control' => 'max-age=0',
        ]);
    }



}