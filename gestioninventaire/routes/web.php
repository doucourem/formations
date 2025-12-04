<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\BoutiqueController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ProduitController;
use App\Http\Controllers\TrimestreController;
use App\Http\Controllers\UserController;

Route::get('/', function () {
    return redirect()->route('login');
});



Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::resource('boutiques', BoutiqueController::class);
    Route::resource('produits', ProduitController::class);
    Route::resource('trimestres', TrimestreController::class);
    Route::resource('boutiques.trimestres', TrimestreController::class)->shallow();
    Route::resource('users', UserController::class);

    Route::get('trimestres/{trimestre}/pdf', [TrimestreController::class, 'exportPdf'])
        ->name('trimestres.pdf');

    // Routes pour les boutiques
    Route::resource('boutiques', BoutiqueController::class);
    // Routes pour les trimestres d'une boutique
    Route::prefix('boutiques/{boutique}')->group(function () {
        Route::get('trimestres', [TrimestreController::class, 'index'])->name('boutiques.trimestres.index');
        Route::get('trimestres/create', [TrimestreController::class, 'create'])->name('boutiques.trimestres.create');
        Route::post('trimestres', [TrimestreController::class, 'store'])->name('boutiques.trimestres.store');
    });

    // Routes pour un trimestre spécifique
    Route::prefix('trimestres/{trimestre}')->group(function () {
        Route::get('edit', [TrimestreController::class, 'edit'])->name('trimestres.edit');
        Route::put('/', [TrimestreController::class, 'update'])->name('trimestres.update');
        Route::get('/', [TrimestreController::class, 'show'])->name('trimestres.show');
        Route::delete('/', [TrimestreController::class, 'destroy'])->name('trimestres.destroy');
    });
});





require __DIR__.'/auth.php';
