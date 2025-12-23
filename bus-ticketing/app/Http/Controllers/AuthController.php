<?php

namespace App\Http\Controllers;

use App\Models\Companies;
use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Bus;
use App\Models\Agency;
use App\Models\Trip;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if (!Auth::attempt($credentials)) {
            return response()->json(['message' => 'Identifiants invalides'], 401);
        }

        $user = Auth::user();

        // ⚠️ Vérifier que c'est un driver
        if ($user->role !== 'driver') {
            return response()->json(['message' => 'Accès réservé aux chauffeurs'], 403);
        }

        $token = $user->createToken('driver-token')->plainTextToken;

        return response()->json([
            'token' => $token,
            'user' => $user->load('driver.bus')
        ]);
    }

    public function me(Request $request)
    {
        return $request->user()->load('driver.bus');
    }
}
