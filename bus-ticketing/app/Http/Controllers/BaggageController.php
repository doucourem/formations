<?php

namespace App\Http\Controllers;
use App\Models\baggages;
use App\Models\Ticket;
use Illuminate\Http\Request;

class BaggageController extends Controller
{

    public function create(Ticket $ticket)
{
    return inertia('Tickets/BaggageForm', [
        'ticket' => $ticket,
    ]);
}


    public function store(Request $request, Ticket $ticket)
    {
        $data = $request->validate([
            'weight' => 'required|numeric|min:0',
            'price' => 'required|numeric|min:0',
        ]);

        $ticket->baggages()->create($data);

        return back()->with('success', 'Bagage ajouté !');
    }
}
