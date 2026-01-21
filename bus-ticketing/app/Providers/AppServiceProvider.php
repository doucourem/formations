<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;
use App\Models\Ticket;
use App\Models\Parcel;
use App\Models\Transfer;
use App\Models\BusMaintenance;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Préchargement Vite
        Vite::prefetch(concurrency: 3);

        // Partage global pour Inertia
        Inertia::share([
            'counters' => function () {
                return [
                    'tickets' => Ticket::count(),
                    'parcels' => Parcel::count(),
                    'transfers' => Transfer::count(),
                    'maintenance_due' => BusMaintenance::where('status', 'due')->count(),
                ];
            },
        ]);
    }
}
