<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\User;
use App\Models\Agency;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    // Liste des utilisateurs
    public function index(Request $request)
    {
        $perPage = (int) $request->input('per_page', 10);
        $role = $request->input('role');

        $users = User::when($role, fn($q) => $q->where('role', $role))
                     ->orderBy('name')
                     ->paginate($perPage)
                     ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => compact('role', 'perPage'),
        ]);
    }

    // Formulaire création
    public function create()
    {
        $agences = Agency::all();
        return Inertia::render('Users/Create', compact('agences'));
    }

    // Formulaire édition
    public function edit(User $user)
    {
        $agences = Agency::all();
        return Inertia::render('Users/Edit', compact('user', 'agences'));
    }

    // Stockage nouvel utilisateur
    public function store(Request $request)
    {
        $validated = $request->validate([
            'prenom' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
            'role' => 'nullable|string',
            'agence_id' => 'nullable|exists:agencies,id',
        ]);

        $user = User::create([
            'prenom' => $validated['prenom'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'] ?? null,
            'agence_id' => $validated['agence_id'] ?? null,
        ]);

        return redirect()->route('users.index')
                         ->with('success', "Utilisateur {$user->name} créé avec succès.");
    }

    // Mise à jour utilisateur
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'prenom' => 'required|string|max:255',
            'name' => 'required|string|max:255',
            'email' => "required|email|unique:users,email,{$user->id}",
            'password' => 'nullable|string|min:6|confirmed',
            'role' => 'nullable|string',
            'agence_id' => 'nullable|exists:agencies,id',
        ]);

        $user->update([
            'prenom' => $validated['prenom'],
            'name' => $validated['name'],
            'email' => $validated['email'],
            'role' => $validated['role'] ?? $user->role,
            'agence_id' => $validated['agence_id'] ?? $user->agence_id,
            'password' => !empty($validated['password']) ? Hash::make($validated['password']) : $user->password,
        ]);

        return redirect()->route('users.index')
                         ->with('success', "Utilisateur {$user->name} mis à jour avec succès.");
    }

    // Suppression utilisateur
    public function destroy(User $user)
    {
        $user->delete();
        return redirect()->route('users.index')
                         ->with('success', "Utilisateur {$user->name} supprimé avec succès.");
    }
}
