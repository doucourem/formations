<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // 1. LES GRANDES VILLES DU PAYS (Impact National)
        $majorCities = [
            'Bamako', 'Kayes', 'Sikasso', 'Mopti', 'Segou', 
            'Gao', 'Kita', 'Koutiala', 'Kenieba', 'Bougouni'
        ];

        DB::table('cities')->insert(array_map(fn($name) => [
            'name' => $name,
            'created_at' => now(),
            'updated_at' => now()
        ], $majorCities));

        // 2. AGENCES STRATÉGIQUES
        $agencies = [];
        foreach ($majorCities as $index => $name) {
            $agencies[] = [
                'name' => 'Direction Régionale - ' . $name,
                'city_id' => $index + 1,
                'address' => 'Gare Routière Principale de ' . $name,
            ];
        }
        DB::table('agencies')->insert($agencies);

        // 3. FLOTTE DE DÉMONSTRATION (VIP & Standard)
        $buses = [
            [
                'registration_number' => 'BM-1234-MD', 
                'model' => 'Volvo B11R VIP', 
                'capacity' => 54, 
                'status' => 'available', 
                'agency_id' => 1
            ],
            [
                'registration_number' => 'SK-5678-MD', 
                'model' => 'Mercedes Tourismo', 
                'capacity' => 45, 
                'status' => 'available', 
                'agency_id' => 3
            ],
            [
                'registration_number' => 'KY-9012-MD', 
                'model' => 'Scania Marcopolo', 
                'capacity' => 60, 
                'status' => 'maintenance', 
                'agency_id' => 2
            ],
        ];
        DB::table('buses')->insert($buses);

        // 4. ROUTES NATIONALES (Distances et Prix réels)
        $routesFromBamako = [
            2 => ['dist' => 495, 'price' => 15000], // Bamako - Kayes
            3 => ['dist' => 375, 'price' => 7500],  // Bamako - Sikasso
            4 => ['dist' => 640, 'price' => 12500], // Bamako - Mopti
            5 => ['dist' => 235, 'price' => 5000],  // Bamako - Segou
            7 => ['dist' => 180, 'price' => 4000],  // Bamako - Kita
            9 => ['dist' => 420, 'price' => 10000], // Bamako - Kenieba
        ];

        $routeData = [];
        foreach ($routesFromBamako as $arrivalId => $data) {
            // Aller
            $routeData[] = [
                'departure_city_id' => 1,
                'arrival_city_id' => $arrivalId,
                'distance' => $data['dist'],
                'price' => $data['price'],
            ];
            // Retour (Automatique)
            $routeData[] = [
                'departure_city_id' => $arrivalId,
                'arrival_city_id' => 1,
                'distance' => $data['dist'],
                'price' => $data['price'],
            ];
        }
        DB::table('routes')->insert($routeData);

        // 5. COMPTES UTILISATEURS (Pour les différents rôles)
        DB::table('users')->insert([
            [
                'name' => 'Ministre Transport',
                'email' => 'ministre@transport.ml',
                'password' => bcrypt('direction2026'),
                'role' => 'admin',
            ],
            [
                'name' => 'Chef d\'Agence Bamako',
                'email' => 'bko@transport.ml',
                'password' => bcrypt('password'),
                'role' => 'manager',
            ]
        ]);
    }
}