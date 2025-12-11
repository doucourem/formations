<?php

namespace App\Http\Controllers;

use Inertia\Inertia;
use App\Models\Garage;
use Illuminate\Http\Request;

class GarageController extends Controller
{
    public function index()
    {
        $garages = Garage::latest()->get();
        return Inertia::render('garages/Index', compact('garages'));
    }

    public function create()
    {
        return Inertia::render('garages/GarageForm');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        Garage::create($request->all());

        return redirect()->route('garages.index');
    }

    public function edit(Garage $garage)
    {
        return Inertia::render('garages/GarageForm', compact('garage'));
    }

    public function update(Request $request, Garage $garage)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'address' => 'nullable|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|max:255',
        ]);

        $garage->update($request->all());

        return redirect()->route('garages.index');
    }

    public function destroy(Garage $garage)
    {
        $garage->delete();
        return redirect()->route('garages.index');
    }
}
