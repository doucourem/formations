<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // --- 1. LES COMPAGNIES ---
        $companies = [
            ['name' => 'SOTRAMA Nationale', 'type' => 'passengers', 'contact' => '+223 20 00 01'],
            ['name' => 'Nour Transport VIP', 'type' => 'passengers', 'contact' => '+223 70 00 02'],
            ['name' => 'Mali Fret Logistique (MFL)', 'type' => 'cargo', 'contact' => '+223 20 00 03'],
            ['name' => 'Hydro-Mali (Citerne)', 'type' => 'cargo', 'contact' => '+223 60 00 04'],
        ];

        foreach ($companies as $comp) {
            DB::table('companies')->updateOrInsert(['name' => $comp['name']], array_merge($comp, ['created_at' => now(), 'updated_at' => now()]));
        }

        // --- 2. LES VILLES ---
        $majorCities = ['Bamako', 'Kayes', 'Sikasso', 'Mopti', 'Segou', 'Gao', 'Kita', 'Koutiala', 'Kenieba', 'Bougouni'];
        foreach ($majorCities as $name) {
            DB::table('cities')->updateOrInsert(['name' => $name], ['created_at' => now(), 'updated_at' => now()]);
        }

        // --- 3. LES AGENCES ---
        foreach ($majorCities as $index => $name) {
            DB::table('agencies')->updateOrInsert(['name' => 'Direction Régionale - ' . $name], [
                'city_id' => $index + 1,
                'company_id' => 1,
                'address' => 'Gare Routière Centrale de ' . $name,
                'created_at' => now(),
                'updated_at' => now()
            ]);
        }

        // --- 4. LA FLOTTE ---
  $buses = [
    ['product_type' => 'bus', 'registration_number' => 'BM-1234-MD', 'model' => 'Volvo B11R VIP', 'capacity' => 54, 'fuel_type' => 'Diesel', 'status' => 'active', 'agency_id' => 1, 'year' => 2023],
    ['product_type' => 'bus', 'registration_number' => 'SK-5678-MD', 'model' => 'Mercedes Tourismo', 'capacity' => 45, 'fuel_type' => 'Diesel', 'status' => 'active', 'agency_id' => 3, 'year' => 2022],
    ['product_type' => 'bus', 'registration_number' => 'BM-2345-MD', 'model' => 'Volvo 9700', 'capacity' => 50, 'fuel_type' => 'Diesel', 'status' => 'active', 'agency_id' => 1, 'year' => 2021],
    ['product_type' => 'bus', 'registration_number' => 'SK-6789-MD', 'model' => 'Iveco Crossway', 'capacity' => 48, 'fuel_type' => 'Diesel', 'status' => 'active', 'agency_id' => 2, 'year' => 2020],
    ['product_type' => 'bus', 'registration_number' => 'BM-3456-MD', 'model' => 'Mercedes Tourismo', 'capacity' => 52, 'fuel_type' => 'Diesel', 'status' => 'active', 'agency_id' => 1, 'year' => 2023],
    ['product_type' => 'bus', 'registration_number' => 'SK-7890-MD', 'model' => 'Volvo B11R', 'capacity' => 55, 'fuel_type' => 'Diesel', 'status' => 'active', 'agency_id' => 3, 'year' => 2022],
    ['product_type' => 'bus', 'registration_number' => 'BM-4567-MD', 'model' => 'Scania Touring', 'capacity' => 50, 'fuel_type' => 'Diesel', 'status' => 'active', 'agency_id' => 2, 'year' => 2021],

    // Camions et citernes
    ['product_type' => 'truck', 'registration_number' => 'FT-8899-MD', 'model' => 'Renault Kerax 440 (Plateau)', 'max_load' => 40000, 'fuel_type' => 'Diesel', 'status' => 'active', 'agency_id' => 1, 'year' => 2021],
    ['product_type' => 'truck', 'registration_number' => 'FT-9900-MD', 'model' => 'Mercedes Arocs 4140', 'max_load' => 38000, 'fuel_type' => 'Diesel', 'status' => 'active', 'agency_id' => 2, 'year' => 2022],
    ['product_type' => 'tanker', 'registration_number' => 'CT-007-MD', 'model' => 'Mercedes Actros Citerne', 'tank_capacity' => 45000, 'compartments' => 5, 'adr_certified' => true, 'fire_extinguisher' => true, 'tank_material' => 'Acier Inoxydable', 'status' => 'active', 'agency_id' => 2, 'year' => 2023],
    ['product_type' => 'tanker', 'registration_number' => 'CT-008-MD', 'model' => 'MAN TGS Citerne', 'tank_capacity' => 50000, 'compartments' => 4, 'adr_certified' => true, 'fire_extinguisher' => true, 'tank_material' => 'Aluminium', 'status' => 'active', 'agency_id' => 3, 'year' => 2022],

    // Ajouter d'autres bus et trucks jusqu'à ~20 véhicules
];



        foreach ($buses as $bus) {
            DB::table('buses')->updateOrInsert(['registration_number' => $bus['registration_number']], array_merge($bus, ['created_at' => now(), 'updated_at' => now()]));
        }

        // --- 5. LES ROUTES ---
        $routesFromBamako = [
            2 => ['dist' => 495, 'price' => 12000], // Kayes
            3 => ['dist' => 375, 'price' => 6000],  // Sikasso
            7 => ['dist' => 180, 'price' => 4000],  // Kita
            9 => ['dist' => 420, 'price' => 8000], // Kenieba
        ];

        foreach ($routesFromBamako as $arrivalId => $data) {
            $common = ['distance' => $data['dist'], 'price' => $data['price'], 'created_at' => now(), 'updated_at' => now()];
            DB::table('routes')->updateOrInsert(['departure_city_id' => 1, 'arrival_city_id' => $arrivalId], $common);
            DB::table('routes')->updateOrInsert(['departure_city_id' => $arrivalId, 'arrival_city_id' => 1], $common);
        }

        // --- 6. UTILISATEURS ---
        DB::table('users')->updateOrInsert(['email' => 'ministre@transport.ml'], [
            'name' => 'Ministre Transport',
            'password' => bcrypt('direction2026'),
            'role' => 'admin',
            'created_at' => now(),
        ]);

        // --- 7. APPELS DES AUTRES SEEDERS ---
        // Décommentez ces lignes une fois les fichiers créés
         $this->call([
            MaintenancePlanSeeder::class,
            MaintenanceTaskSeeder::class,
           MaintenanceAndGarageSeeder::class,
            TripsAndTicketsSeeder::class,
            //HeavyVehicleSeeder::class,
            UsersSeeder::class,
            DeliverySeeder::class,
         ]);
    }
}