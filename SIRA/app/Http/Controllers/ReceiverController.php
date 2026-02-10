<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Receiver;
use Inertia\Inertia;

class ReceiverController extends Controller
{
    // Optionnel : liste tous les destinataires (si besoin)
    public function index()
    {
        $receivers = Receiver::all();
        return Inertia::render('Receivers/Index', [
            'receivers' => $receivers
        ]);
    }

    // Création depuis le formulaire Inertia
    public function store(Request $request)
    {
        // Validation
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:receivers,phone',
        ]);

        // Création du destinataire
        $receiver = Receiver::create([
            'name' => $request->name,
            'phone' => $request->phone,
        ]);

        // Réponse Inertia pour le frontend
        return back()->with(['receiver' => $receiver]);
    }
}
