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
            ['product_type' => 'bus', 'registration_number' => 'BM-1234-MD', 'model' => 'Volvo B11R VIP', 'capacity' => 54, 'fuel_type' => 'Diesel', 'status' => 'available', 'agency_id' => 1, 'company_id' => 1, 'year' => 2023],
            ['product_type' => 'bus', 'registration_number' => 'SK-5678-MD', 'model' => 'Mercedes Tourismo', 'capacity' => 45, 'fuel_type' => 'Diesel', 'status' => 'available', 'agency_id' => 3, 'company_id' => 2, 'year' => 2022],
            ['product_type' => 'truck', 'registration_number' => 'FT-8899-MD', 'model' => 'Renault Kerax 440 (Plateau)', 'max_load' => 40000, 'fuel_type' => 'Diesel', 'status' => 'available', 'agency_id' => 1, 'company_id' => 3, 'year' => 2021],
            ['product_type' => 'tanker', 'registration_number' => 'CT-007-MD', 'model' => 'Mercedes Actros Citerne', 'tank_capacity' => 45000, 'compartments' => 5, 'adr_certified' => true, 'fire_extinguisher' => true, 'tank_material' => 'Acier Inoxydable', 'status' => 'available', 'agency_id' => 2, 'company_id' => 4, 'year' => 2023],
        ];

        foreach ($buses as $bus) {
            DB::table('buses')->updateOrInsert(['registration_number' => $bus['registration_number']], array_merge($bus, ['created_at' => now(), 'updated_at' => now()]));
        }

        // --- 5. LES ROUTES ---
        $routesFromBamako = [
            2 => ['dist' => 495, 'price' => 15000], // Kayes
            3 => ['dist' => 375, 'price' => 7500],  // Sikasso
            7 => ['dist' => 180, 'price' => 4000],  // Kita
            9 => ['dist' => 420, 'price' => 10000], // Kenieba
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
            'company_id' => null,
            'created_at' => now(),
        ]);

        // --- 7. APPELS DES AUTRES SEEDERS ---
        // Décommentez ces lignes une fois les fichiers créés
         $this->call([
           MaintenanceAndGarageSeeder::class,
            TripsAndTicketsSeeder::class,
            LogisticsAndExpensesSeeder::class,
         DeliveryAndRentalSeeder::class,
        HeavyVehicleSeeder::class,
         ]);
    }
}