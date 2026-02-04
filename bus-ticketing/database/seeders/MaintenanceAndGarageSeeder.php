<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Bus;
use App\Models\Garage;
use Carbon\Carbon;

class MaintenanceAndGarageSeeder extends Seeder
{
    public function run(): void
    {
        $buses = Bus::all();
        
        // 1. Création de Garages Partenaires
        $garages = [
            ['name' => 'Garage Central de la Somatra', 'address' => 'Zone Industrielle, Bamako'],
            ['name' => 'Atelier Technique de Kayes', 'address' => 'Quartier Plateau, Kayes'],
            ['name' => 'Garage Moderne de Sikasso', 'address' => 'Route de Bougouni, Sikasso'],
        ];
        
        foreach ($garages as $g) {
            DB::table('garages')->insert(array_merge($g, [
                'created_at' => now(),
                'updated_at' => now()
            ]));
        }

        $garageIds = DB::table('garages')->pluck('id')->toArray();

        // 2. Historique des Maintenances sur 30 jours
        foreach ($buses as $bus) {
            // On simule 2 maintenances par bus sur le mois
            for ($i = 0; $i < 2; $i++) {
                $date = Carbon::now()->subDays(rand(1, 30));
                
                $maintenanceId = DB::table('bus_maintenances')->insertGetId([
                    'bus_id' => $bus->id,
                    'garage_id' => $garageIds[array_rand($garageIds)],
                    'maintenance_type' => fake()->randomElement(['Préventive', 'Curative', 'Vidange', 'Pneumatique']),
                    'description' => fake()->randomElement([
                        'Remplacement filtre à huile et révision moteur',
                        'Changement des plaquettes de frein avant',
                        'Vérification système de climatisation',
                        'Permutation des pneus et parallélisme'
                    ]),
                    'cost' => rand(50000, 250000),
                    'status' => 'completed',
                    'maintenance_date' => $date,
                    'created_at' => $date,
                ]);

                // 3. Détails des tâches pour la démonstration (Log de maintenance)
                DB::table('maintenance_tasks')->insert([
                    ['maintenance_id' => $maintenanceId, 'task_name' => 'Main d\'œuvre', 'status' => 'done'],
                    ['maintenance_id' => $maintenanceId, 'task_name' => 'Pièces de rechange', 'status' => 'done'],
                ]);
            }
        }

        // 4. ALERTE POUR LA DÉMO : Une maintenance en cours (Actionnable)
        $urgentBus = $buses->first();
        DB::table('bus_maintenances')->insert([
            'bus_id' => $urgentBus->id,
            'garage_id' => $garageIds[0],
            'maintenance_type' => 'Réparation Urgente',
            'description' => 'Problème de boîte de vitesse signalé par le chauffeur',
            'cost' => 450000,
            'status' => 'in_progress',
            'maintenance_date' => now(),
            'created_at' => now(),
        ]);
        
        // Immobiliser le bus pour la démo
        $urgentBus->update(['status' => 'maintenance']);
    }
}