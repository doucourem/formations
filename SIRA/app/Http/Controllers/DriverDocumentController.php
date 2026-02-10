<?php

namespace App\Http\Controllers;

use App\Models\Driver;
use App\Models\DriverDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class DriverDocumentController extends Controller
{
    /**
     * Liste des documents d’un chauffeur
     */
    public function index(Driver $driver)
    {
        $documents = $driver->documents()->orderBy('created_at', 'desc')->get()->map(function ($doc) {
            return [
                'id'         => $doc->id,
                'type'       => $doc->type,
                'file_path'  => $doc->file_path ? asset('storage/' . $doc->file_path) : null,
                'expires_at' => $doc->expires_at?->toDateString() ?? '-',
                'created_at' => $doc->created_at?->toDateTimeString() ?? '',
            ];
        });

        return Inertia::render('Drivers/Documents/Index', [
            'driver'    => [
                'id'         => $driver->id,
                'first_name' => $driver->first_name,
                'last_name'  => $driver->last_name,
            ],
            'documents' => $documents,
        ]);
    }

    /**
     * Upload et enregistrement d’un document chauffeur
     */
    public function store(Request $request, Driver $driver)
    {
        $validated = $request->validate([
            'type'        => 'required|string|max:255',
            'file'        => 'required|file|max:4096', // 4Mo
            'expires_at'  => 'nullable|date',
        ]);

        // Stockage du fichier
        $path = $request->file('file')->store('driver_docs', 'public');

        // Création du document
        $driver->documents()->create([
            'type'       => $validated['type'],
            'file_path'  => $path,
            'expires_at' => $validated['expires_at'] ?? null,
        ]);

        return back()->with('success', 'Document ajouté avec succès.');
    }

    /**
     * Suppression d’un document
     */
    public function destroy(Driver $driver, DriverDocument $document)
    {
        // Vérifie que le document appartient bien au chauffeur
        if ($document->driver_id !== $driver->id) {
            abort(403, "Ce document n'appartient pas à ce chauffeur.");
        }

        // Suppression du fichier physique
        if ($document->file_path && Storage::disk('public')->exists($document->file_path)) {
            Storage::disk('public')->delete($document->file_path);
        }

        // Suppression en DB
        $document->delete();

        return back()->with('success', 'Document supprimé.');
    }
}
