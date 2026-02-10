<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MaintenancePlan;

class MaintenancePlanSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Entretien quotidien',
                'interval_type' => 'days',
                'interval_value' => 1,
                'vehicle_type' => 'all',
                'description' => 'Contrôles journaliers avant service',
            ],
            [
                'name' => 'Entretien hebdomadaire',
                'interval_type' => 'days',
                'interval_value' => 7,
                'vehicle_type' => 'all',
                'description' => 'Graissage et contrôles généraux',
            ],
            [
                'name' => 'Vidange moteur',
                'interval_type' => 'km',
                'interval_value' => 5000,
                'vehicle_type' => 'truck',
                'description' => 'Vidange + filtre à huile',
            ],
            [
                'name' => 'Grande révision annuelle',
                'interval_type' => 'days',
                'interval_value' => 365,
                'vehicle_type' => 'all',
                'description' => 'Révision complète annuelle',
            ],
        ];

        foreach ($plans as $plan) {
            MaintenancePlan::create($plan);
        }
    }
}
