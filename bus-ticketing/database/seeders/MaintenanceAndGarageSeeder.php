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

        /*
        |--------------------------------------------------------------------------
        | 1. Garages
        |--------------------------------------------------------------------------
        */
        $garages = [
            ['name' => 'Garage Central SOTRAMA', 'address' => 'Zone Industrielle, Bamako'],
            ['name' => 'Atelier Poids Lourds Kayes', 'address' => 'Avenue de la Gare, Kayes'],
            ['name' => 'Sikasso Diesel Tech', 'address' => 'Route de Bougouni, Sikasso'],
        ];

        foreach ($garages as $garage) {
            DB::table('garages')->updateOrInsert(
                ['name' => $garage['name']],
                array_merge($garage, [
                    'created_at' => now(),
                    'updated_at' => now(),
                ])
            );
        }

        $garageIds = DB::table('garages')->pluck('id')->toArray();

        /*
        |--------------------------------------------------------------------------
        | 2. Historique des maintenances
        |--------------------------------------------------------------------------
        */
        foreach ($buses as $bus) {
            $isHeavy = in_array($bus->product_type, ['truck', 'tanker']);

            $maintenanceCount = rand(1, 3);

            for ($i = 0; $i < $maintenanceCount; $i++) {
                $date = Carbon::now()->subDays(rand(5, 45));

                $maintenanceId = DB::table('bus_maintenances')->insertGetId([
                    'bus_id'            => $bus->id,
                    'garage_id'         => $garageIds[array_rand($garageIds)],
                    'type'              => fake()->randomElement(['Vidange', 'Pneumatique', 'Révision']),
                    'maintenance_date'  => $date,
                    'status'            => 'done',
                    'cost'              => $isHeavy ? rand(150000, 400000) : rand(45000, 150000),
                    'labour_cost'       => $isHeavy ? rand(50000, 120000) : rand(20000, 50000),
                    'duration_hours'    => rand(2, 8),
                    'mileage'           => rand(20000, 250000),
                    'notes'             => $isHeavy
                        ? 'Révision système hydraulique et freinage'
                        : 'Vidange moteur et remplacement des filtres',
                    'created_at'        => $date,
                    'updated_at'        => $date,
                ]);

            }
        }

        /*
        |--------------------------------------------------------------------------
        | 3. MAINTENANCE URGENTE (bus bloqué)
        |--------------------------------------------------------------------------
        */
        $urgentBus = $buses->where('product_type', 'tanker')->first()
            ?? $buses->first();

        DB::table('bus_maintenances')->insert([
            'bus_id'           => $urgentBus->id,
            'garage_id'        => $garageIds[0],
            'type'             => 'Curative Urgente',
            'maintenance_date' => now(),
            'status'           => 'planned',
            'cost'             => 600000,
            'labour_cost'      => 200000,
            'duration_hours'   => 12,
            'mileage'          => rand(80000, 200000),
            'notes'            => 'Alerte fuite réservoir – réparation immédiate requise',
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        // Le bus disparaît des trajets disponibles
       
    }
}
