<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Transfer;
use App\Models\Sender;
use App\Models\Receiver;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class TransferController extends Controller
{
    // 🔹 Liste des transferts avec filtres et pagination
    public function index(Request $request)
    {
        $query = Transfer::with(['sender', 'receiver']);

        if ($request->sender) {
            $query->whereHas('sender', fn($q) => $q->where('name', 'like', "%{$request->sender}%"));
        }

        if ($request->receiver) {
            $query->whereHas('receiver', fn($q) => $q->where('name', 'like', "%{$request->receiver}%"));
        }

        if ($request->code) {
            $query->where('withdraw_code', $request->code);
        }

        if ($request->status) {
            $query->where('status', $request->status);
        }

        $perPage = $request->per_page ?? 10;

        $transfers = $query->orderBy('created_at', 'desc')->paginate($perPage)->appends($request->all());

        // Transformer pour API
        $transfers->getCollection()->transform(fn($t) => [
            'id' => $t->id,
            'sender' => [
                'id' => $t->sender->id,
                'name' => $t->sender->name,
            ],
            'receiver' => [
                'id' => $t->receiver->id,
                'name' => $t->receiver->name,
            ],
            'amount' => $t->amount,
            'fees' => $t->fees,
            'withdraw_code' => $t->withdraw_code,
            'status' => $t->status,
            'paid' => $t->paid,
            'payment_proof' => $t->payment_proof,
            'created_at' => $t->created_at->toDateTimeString(),
        ]);

        return response()->json([
            'data' => $transfers->items(),
            'meta' => [
                'current_page' => $transfers->currentPage(),
                'last_page' => $transfers->lastPage(),
                'per_page' => $transfers->perPage(),
                'total' => $transfers->total(),
            ],
        ]);
    }

    // 🔹 Créer un transfert
    public function store(Request $request)
    {
        $data = $request->validate([
            'sender_id' => 'required|exists:senders,id',
            'receiver_id' => 'required|exists:receivers,id',
            'amount' => 'required|numeric|min:1',
            'fees' => 'nullable|numeric|min:0',
        ]);

        // Générer un code de retrait unique
        $withdraw_code = strtoupper(Str::random(6));

        $transfer = Transfer::create([
            'sender_id' => $data['sender_id'],
            'receiver_id' => $data['receiver_id'],
            'amount' => $data['amount'],
            'fees' => $data['fees'] ?? ($data['amount'] * 0.02),
            'withdraw_code' => $withdraw_code,
            'status' => 'sent',
        ]);

        return response()->json([
            'message' => 'Transfert créé avec succès',
            'transfer' => $transfer,
        ], 201);
    }

    // 🔹 Afficher un transfert
    public function show(Transfer $transfer)
    {
        $transfer->load(['sender', 'receiver']);
        return response()->json(['transfer' => $transfer]);
    }

    // 🔹 Mettre à jour un transfert
    public function update(Request $request, Transfer $transfer)
    {
        $data = $request->validate([
            'sender_id' => 'required|exists:senders,id',
            'receiver_id' => 'required|exists:receivers,id',
            'amount' => 'required|numeric|min:1',
            'fees' => 'nullable|numeric|min:0',
            'status' => 'nullable|string',
            'paid' => 'nullable|boolean',
        ]);

        $transfer->update([
            'sender_id' => $data['sender_id'],
            'receiver_id' => $data['receiver_id'],
            'amount' => $data['amount'],
            'fees' => $data['fees'] ?? ($data['amount'] * 0.02),
            'status' => $data['status'] ?? $transfer->status,
            'paid' => $data['paid'] ?? $transfer->paid,
        ]);

        return response()->json([
            'message' => 'Transfert mis à jour avec succès',
            'transfer' => $transfer,
        ]);
    }

    // 🔹 Supprimer un transfert
    public function destroy(Transfer $transfer)
    {
        $transfer->delete();
        return response()->json(['message' => 'Transfert supprimé']);
    }

    // 🔹 Statistiques journalières / période
    public function daily(Request $request)
    {
        $query = Transfer::query();

        if ($request->has('date') && $request->date) {
            $query->whereDate('created_at', $request->date);
        }

        if ($request->has('start_date') && $request->start_date &&
            $request->has('end_date') && $request->end_date) {
            $query->whereBetween('created_at', [$request->start_date, $request->end_date]);
        }

        $stats = $query
            ->selectRaw('DATE(created_at) as day, COUNT(*) as total_transfers, SUM(amount) as total_amount, SUM(fees) as total_fees')
            ->groupBy('day')
            ->orderBy('day', 'desc')
            ->get();

        return response()->json(['data' => $stats]);
    }

    // 🔹 Export Excel
    public function export(Request $request)
    {
        $query = Transfer::with(['sender', 'receiver']);

        if ($request->sender) {
            $query->whereHas('sender', fn($q) => $q->where('name', 'like', "%{$request->sender}%"));
        }
        if ($request->receiver) {
            $query->whereHas('receiver', fn($q) => $q->where('name', 'like', "%{$request->receiver}%"));
        }
        if ($request->code) $query->where('withdraw_code', $request->code);
        if ($request->status) $query->where('status', $request->status);

        $transfers = $query->orderByDesc('created_at')->get();

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->fromArray([['ID','Expéditeur','Destinataire','Montant','Frais','Code retrait','Statut','Paiement reçu','Date']], null, 'A1');

        $row = 2;
        foreach ($transfers as $t) {
            $sheet->setCellValue('A'.$row, $t->id)
                  ->setCellValue('B'.$row, $t->sender->name)
                  ->setCellValue('C'.$row, $t->receiver->name)
                  ->setCellValue('D'.$row, $t->amount)
                  ->setCellValue('E'.$row, $t->fees)
                  ->setCellValue('F'.$row, $t->withdraw_code)
                  ->setCellValue('G'.$row, ucfirst($t->status))
                  ->setCellValue('H'.$row, $t->paid ? 'Oui' : 'Non')
                  ->setCellValue('I'.$row, $t->created_at->format('d/m/Y H:i'));
            $row++;
        }

        $writer = new Xlsx($spreadsheet);
        $filename = 'transfers_export_' . now()->format('Ymd_His') . '.xlsx';
        ob_end_clean();

        return response()->stream(function() use ($writer) {
            $writer->save('php://output');
        }, 200, [
            'Content-Type' => 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition' => 'attachment; filename="'.$filename.'"',
            'Cache-Control' => 'max-age=0',
        ]);
    }

    // 🔹 Liste de tous les expéditeurs
public function senders()
{
    $senders = Sender::all(['id', 'name']);
    return response()->json(['data' => $senders]);
}

// 🔹 Liste de tous les destinataires
public function receivers()
{
    $receivers = Receiver::all(['id', 'name']);
    return response()->json(['data' => $receivers]);
}

}
