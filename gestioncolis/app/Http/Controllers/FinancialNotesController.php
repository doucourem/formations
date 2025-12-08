<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Models\FinancialNote;

class FinancialNotesController extends Controller
{
  public function index(Request $request)
{
    $user = $request->user();
    if (!$user) {
        abort(403, 'Utilisateur non authentifié');
    }

    // Date sélectionnée, par défaut aujourd'hui
    $date = $request->query('date', now()->toDateString());

    // Définir début et fin de la journée
    $startOfDay = $date . ' 00:00:00';
    $endOfDay = $date . ' 23:59:59';

    // Chercher la note existante pour cet utilisateur et cette date
    $note = FinancialNote::where('created_by', $user->id)
        ->whereBetween('created_at', [$startOfDay, $endOfDay])
        ->latest()
        ->first();

    // Créer une note vide si aucune n'existe
    if (!$note) {
        $note = FinancialNote::create([
            'created_by' => $user->id,
            'updated_by' => $user->id,
            'global_cash_balance' => 0,
            'yawi_ash_balance' => 0,
            'lpv_balance' => 0,
            'airtel_money_balance' => 0,
            'available_cash' => 0,
            'balde_alpha_debt' => 0,
            'md_owes_us' => 0,
            'we_owe_md' => 0,
            'notes' => '',
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    return Inertia::render('Transfers/FinancialNotesPage', [
        // Convertir l'objet en tableau pour Inertia
        'notes' => $note->toArray(),
        'selectedDate' => $date,
    ]);
}


    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $data = $request->validate([
            'globalCashBalance' => 'required|numeric',
            'yawiAshBalance' => 'required|numeric',
            'lpvBalance' => 'required|numeric',
            'airtelMoneyBalance' => 'required|numeric',
            'availableCash' => 'required|numeric',
            'baldeAlphaDebt' => 'required|numeric',
            'mdOwesUs' => 'required|numeric',
            'weOweMd' => 'required|numeric',
            'notes' => 'nullable|string',
        ]);

        $note = FinancialNote::where('id', $id)->where('created_by', $user->id)->firstOrFail();
        $note->update([
            'global_cash_balance' => $data['globalCashBalance'],
            'yawi_ash_balance' => $data['yawiAshBalance'],
            'lpv_balance' => $data['lpvBalance'],
            'airtel_money_balance' => $data['airtelMoneyBalance'],
            'available_cash' => $data['availableCash'],
            'balde_alpha_debt' => $data['baldeAlphaDebt'],
            'md_owes_us' => $data['mdOwesUs'],
            'we_owe_md' => $data['weOweMd'],
            'notes' => $data['notes'],
            'updated_by' => $user->id,
            'updated_at' => now(),
        ]);

        return redirect()->back()->with('success', 'Note mise à jour avec succès.');
    }
}
