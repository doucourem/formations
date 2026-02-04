<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\Bus;
use Carbon\Carbon;

class MaintenanceAndGarageSeeder extends Seeder
{
    public function run(): void
    {
        $buses = Bus::all();
        
        // 1. Garages avec spécialisation
        $garages = [
            ['name' => 'Garage Central SOTRAMA', 'address' => 'Zone Industrielle, Bamako'],
            ['name' => 'Atelier Poids Lourds Kayes', 'address' => 'Avenue de la Gare, Kayes'],
            ['name' => 'Sikasso Diesel Tech', 'address' => 'Route de Bougouni, Sikasso'],
        ];
        
        foreach ($garages as $g) {
            DB::table('garages')->updateOrInsert(['name' => $g['name']], array_merge($g, [
                'created_at' => now(), 'updated_at' => now()
            ]));
        }

        $garageIds = DB::table('garages')->pluck('id')->toArray();

        // 2. Historique des Maintenances
        foreach ($buses as $bus) {
            $isHeavy = in_array($bus->product_type, ['truck', 'tanker']);
            
            for ($i = 0; $i < rand(1, 3); $i++) {
                $date = Carbon::now()->subDays(rand(5, 45));
                
                $maintenanceId = DB::table('bus_maintenances')->insertGetId([
                    'bus_id' => $bus->id,
                    'garage_id' => $garageIds[array_rand($garageIds)],
                    'maintenance_type' => fake()->randomElement(['Vidange', 'Pneumatique', 'Révision']),
                    'description' => $isHeavy ? 'Révision système hydraulique et freinage' : 'Vidange moteur et changement filtres',
                    'cost' => $isHeavy ? rand(150000, 400000) : rand(45000, 150000),
                    'status' => 'completed',
                    'maintenance_date' => $date,
                    'created_at' => $date,
                ]);

                DB::table('maintenance_tasks')->insert([
                    ['maintenance_id' => $maintenanceId, 'task_name' => 'Main d\'œuvre', 'status' => 'done'],
                    ['maintenance_id' => $maintenanceId, 'task_name' => 'Pièces détachées', 'status' => 'done'],
                ]);
            }
        }

        // 3. LE POINT CHOC : Maintenance Urgente en cours
        $urgentBus = $buses->where('product_type', 'tanker')->first() ?? $buses->first();
        
        DB::table('bus_maintenances')->insert([
            'bus_id' => $urgentBus->id,
            'garage_id' => $garageIds[0],
            'maintenance_type' => 'Curative Urgente',
            'description' => 'Alerte fuite réservoir - Réparation immédiate requise',
            'cost' => 600000,
            'status' => 'in_progress',
            'maintenance_date' => now(),
            'created_at' => now(),
        ]);
        
        // On met à jour le statut du bus pour qu'il disparaisse des trajets disponibles
        $urgentBus->update(['status' => 'maintenance']);
    }
}