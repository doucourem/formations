<?php

namespace App\Http\Controllers;

use App\Models\Companies;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    /**
     * Liste des compagnies
     */
    public function index()
    {
        $companies = Companies::latest()->paginate(10);

        return inertia('Companies/Index', [
            'companies' => $companies
        ]);
        // ou return response()->json($companies);
    }

    /**
     * Formulaire création
     */
    public function create()
    {
        return inertia('Companies/Create');
    }

    /**
     * Enregistrer une compagnie
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'type'    => 'required|in:passengers,cargo',
            'address' => 'nullable|string|max:255',
            'contact' => 'nullable|string|max:255',
            'logo'    => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $validated['logo'] = $request->file('logo')
                ->store('companies', 'public');
        }

        Companies::create($validated);

        return redirect()->route('companies.index')
            ->with('success', 'Compagnie créée avec succès');
    }

    /**
     * Détails d’une compagnie
     */
    public function show(Companies $company)
    {
        return inertia('Companies/Show', [
            'company' => $company
        ]);
    }

    /**
     * Formulaire édition
     */
    public function edit(Companies $company)
    {
        return inertia('Companies/Edit', [
            'company' => $company
        ]);
    }

    /**
     * Mise à jour
     */
    public function update(Request $request, Companies $company)
    {
        $validated = $request->validate([
            'name'    => 'required|string|max:255',
            'type'    => 'required|in:passengers,cargo',
            'address' => 'nullable|string|max:255',
            'contact' => 'nullable|string|max:255',
            'logo'    => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($company->logo) {
                Storage::disk('public')->delete($company->logo);
            }

            $validated['logo'] = $request->file('logo')
                ->store('companies', 'public');
        }

        $company->update($validated);

        return redirect()->route('companies.index')
            ->with('success', 'Compagnie mise à jour');
    }

    /**
     * Suppression
     */
    public function destroy(Companies $company)
    {
        if ($company->logo) {
            Storage::disk('public')->delete($company->logo);
        }

        $company->delete();

        return redirect()->route('companies.index')
            ->with('success', 'Compagnie supprimée');
    }
}
