<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Database\Seeders\TicketsTableSeeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ----------------------
        // 1. Villes
        // ----------------------
        $cityNames = [
            'Bamako',
            'Kita',
            'Kenieba',
            'Tabakoto',
            'Sakola Bada',
            'Djidian',
            'Kofing',
            'Sitakily',
            'Dialafara',
            'Bourdala',
        ];

        DB::table('cities')->insert(array_map(fn($name) => ['name' => $name], $cityNames));

        // ----------------------
        // 2. Agences
        // ----------------------
        $agencies = [];
        foreach ($cityNames as $index => $name) {
            $agencies[] = [
                'name' => 'Agence ' . $name,
                'city_id' => $index + 1,
                'address' => 'Centre-ville de ' . $name,
            ];
        }
        DB::table('agencies')->insert($agencies);

        // ----------------------
        // 3. Bus
        // ----------------------
        $buses = [
            ['registration_number' => 'BUS1', 'model' => 'Toyota Coaster', 'capacity' => 30, 'status' => 'available', 'agency_id' => 1],
            ['registration_number' => 'BUS2', 'model' => 'Hyundai County', 'capacity' => 40, 'status' => 'available', 'agency_id' => 2],
            ['registration_number' => 'BUS3', 'model' => 'Mercedes Sprinter', 'capacity' => 20, 'status' => 'maintenance', 'agency_id' => 3],
        ];
        DB::table('buses')->insert($buses);

        // ----------------------
        // 4. Routes avec prix + distance
        // ----------------------
        $routes = [];

        // Distances estimées Bamako ↔ autres villes (en km)
        $distancesFromBamako = [
            2 => 180, // Bamako - Kita
            3 => 420, // Bamako - Kenieba
            4 => 450, // Bamako - Tabakoto
            5 => 460, // Bamako - Sakola Bada
            6 => 470, // Bamako - Djidian
            7 => 480, // Bamako - Kofing
            8 => 490, // Bamako - Sitakily
            9 => 500, // Bamako - Dialafara
            10 => 510, // Bamako - Bourdala
        ];

        // Prix = distance * 25 FCFA/km (moyenne)
        foreach ($distancesFromBamako as $arrival => $distance) {
            $routes[] = [
                'departure_city_id' => 1,
                'arrival_city_id' => $arrival,
                'distance' => $distance,
                'price' => $distance * 25,
            ];
        }

        // Distances estimées Kenieba ↔ autres villes
        $distancesFromKenieba = [
            1 => 420, // Kenieba - Bamako
            2 => 240, // Kenieba - Kita
            4 => 40,  // Kenieba - Tabakoto
            5 => 50,
            6 => 60,
            7 => 70,
            8 => 80,
            9 => 90,
            10 => 100,
        ];

        foreach ($distancesFromKenieba as $arrival => $distance) {
            $routes[] = [
                'departure_city_id' => 3,
                'arrival_city_id' => $arrival,
                'distance' => $distance,
                'price' => $distance * 25,
            ];
        }

        DB::table('routes')->insert($routes);

        // ----------------------
        // 5. Admin user
        // ----------------------
        DB::table('users')->insert([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => bcrypt('password'),
            'role' => 'admin',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        // ----------------------
        // 6. Tickets seeder
        // ----------------------
    
    }
}
