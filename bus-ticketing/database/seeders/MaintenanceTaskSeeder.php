<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\MaintenancePlan;

class MaintenanceTaskSeeder extends Seeder
{
    public function run(): void
    {
        $daily = MaintenancePlan::where('name', 'Entretien quotidien')->first();
        $weekly = MaintenancePlan::where('name', 'Entretien hebdomadaire')->first();
        $oil = MaintenancePlan::where('name', 'Vidange moteur')->first();

        $daily?->tasks()->createMany([
            ['task_name' => 'Vérifier niveau huile moteur'],
            ['task_name' => 'Vérifier liquide de refroidissement'],
            ['task_name' => 'Contrôler pneus et freins'],
        ]);

        $weekly?->tasks()->createMany([
            ['task_name' => 'Graissage des articulations'],
            ['task_name' => 'Contrôle suspension'],
            ['task_name' => 'Vérification filtres à air'],
        ]);

        $oil?->tasks()->createMany([
            ['task_name' => 'Vidange huile moteur'],
            ['task_name' => 'Remplacement filtre à huile'],
            ['task_name' => 'Contrôle fuites'],
        ]);
    }
}
