<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sender;
use Inertia\Inertia;

class SenderController extends Controller
{
    // Liste tous les expéditeurs de l'utilisateur connecté
    public function index()
    {
        $senders = Sender::where('user_id', auth()->id())->get();

        return Inertia::render('Senders/Index', [
            'senders' => $senders
        ]);
    }

    // Création depuis le formulaire Inertia
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:senders,phone',
        ]);

        $sender = Sender::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'user_id' => auth()->id(), // lie le sender à l'utilisateur connecté
        ]);

        // Renvoie le sender créé pour mise à jour dynamique côté frontend
        return back()->with(['sender' => $sender]);
    }
}
