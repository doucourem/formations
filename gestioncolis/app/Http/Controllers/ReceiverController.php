<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Receiver;
use Inertia\Inertia;

class ReceiverController extends Controller
{
    // Liste tous les destinataires de l'utilisateur connecté
    public function index()
    {
        $receivers = Receiver::where('user_id', auth()->id())->get();

        return Inertia::render('Receivers/Index', [
            'receivers' => $receivers
        ]);
    }

    // Création depuis le formulaire Inertia
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'phone' => 'required|string|max:20|unique:receivers,phone',
        ]);

        $receiver = Receiver::create([
            'name' => $request->name,
            'phone' => $request->phone,
            'user_id' => auth()->id(), // lie le destinataire à l'utilisateur connecté
        ]);

        // Renvoie le receiver créé pour mise à jour dynamique côté frontend
        return back()->with(['receiver' => $receiver]);
    }
}
