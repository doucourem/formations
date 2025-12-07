<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Sender;
use Inertia\Inertia;

class SenderController extends Controller
{
    // Optionnel : liste tous les expéditeurs (si besoin)
    public function index()
    {
        $senders = Sender::all();
        return Inertia::render('Senders/Index', [
            'senders' => $senders
        ]);
    }

    // Création depuis le formulaire Inertia
    public function store(Request $request)
    {
        // Validation
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:senders,phone',
        ]);

        // Création du sender
        $sender = Sender::create([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        // Réponse Inertia pour le frontend
        // On renvoie le sender créé pour l'ajouter à la liste dynamiquement
        return back()->with(['sender' => $sender]);
    }
}
