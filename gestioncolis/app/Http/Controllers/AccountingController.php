<?php

namespace App\Http\Controllers;

use App\Models\ThirdParty;
use App\Models\Transaction;
use App\Models\Setting;
use App\Models\UserField;
use App\Models\FinancialNote;
use App\Models\FinancialNoteValue;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;
use Auth;

class AccountingController extends Controller
{
    public function index(Request $request)
    {
        $user = Auth::user();

        $month = $request->query('month', now()->format('Y-m'));

        $start = Carbon::parse("$month-01")->startOfMonth();
        $end   = Carbon::parse("$month-01")->endOfMonth();

        return Inertia::render('AccountingPage', [
            'clients' => ThirdParty::select('id','name','phone','email','created_at','total_sent','total_to_pay','current_debt','previous_debt')
                ->orderBy('name')->get(),

            'transactions' => Transaction::with('payments')
                ->whereBetween('created_at', [$start, $end])
                ->orderBy('created_at', 'desc')
                ->get(),

            'prelevementRate' => Setting::firstOrCreate(
                ['key' => 'prelevement_rate', 'user_id' => $user->id],
                ['value' => 7.5]
            )->value,

            'inventoryFields' => UserField::where('user_id', $user->id)->get(),

            'notes' => FinancialNote::with('values')
                ->where('created_by', $user->id)
                ->orderBy('created_at', 'desc')
                ->first(),
        ]);
    }

    public function saveRate(Request $request)
    {
        $rate = $request->validate(['rate' => 'required|numeric|min:0|max:100']);
        $setting = Setting::updateOrCreate(
            ['key' => 'prelevement_rate','user_id' => Auth::id()],
            ['value' => $rate['rate']]
        );

        return response()->json(['success' => true, 'value' => $setting->value]);
    }
}
