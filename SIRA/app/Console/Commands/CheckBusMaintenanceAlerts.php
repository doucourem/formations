<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Bus;
use App\Models\BusMaintenance;
use Illuminate\Support\Facades\Log;

class CheckBusMaintenanceAlerts extends Command
{
    protected $signature = 'maintenance:check-buses';
    protected $description = 'Alertes maintenance bus';

    public function handle()
    {
        $today = now()->toDateString();

        // 🔔 Alertes date
        $dateAlerts = Bus::whereNotNull('next_maintenance_date')
            ->whereDate('next_maintenance_date', '<=', now()->addDays(7))
            ->get();

        foreach ($dateAlerts as $bus) {
            Log::warning("ALERTE DATE : Bus {$bus->registration_number}");
        }

        // 🔔 Alertes kilométrage
        $kmAlerts = BusMaintenance::whereNotNull('next_maintenance_mileage')
            ->whereHas('bus', function ($q) {
                $q->whereColumn(
                    'buses.mileage',
                    '>=',
                    'bus_maintenances.next_maintenance_mileage'
                );
            })
            ->get();

        foreach ($kmAlerts as $m) {
            Log::warning(
                "ALERTE KM : Bus {$m->bus->registration_number}"
            );
        }

        return Command::SUCCESS;
    }
}

