<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Database\Seeders\TicketsTableSeeder; // ✅ Import du seeder de tickets

class DatabaseSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // ----------------------
        // 1. Villes
        // ----------------------
        $cities = [
            ['name' => 'Bamako'],
            ['name' => 'Sikasso'],
            ['name' => 'Segou'],
            ['name' => 'Kayes'],
        ];
        DB::table('cities')->insert($cities);

        // ----------------------
        // 2. Agences
        // ----------------------
        $agencies = [
            ['name' => 'Agence Bamako', 'city_id' => 1, 'address' => 'Rue du marché'],
            ['name' => 'Agence Sikasso', 'city_id' => 2, 'address' => 'Avenue principale'],
            ['name' => 'Agence Segou', 'city_id' => 3, 'address' => 'Place centrale'],
        ];
        DB::table('agencies')->insert($agencies);

        // ----------------------
        // 3. Buses
        // ----------------------
        $buses = [
            ['registration_number' => 'ML-1234-AB', 'model' => 'Toyota Coaster', 'capacity' => 30, 'status' => 'available', 'agency_id' => 1],
            ['registration_number' => 'ML-5678-CD', 'model' => 'Hyundai County', 'capacity' => 40, 'status' => 'available', 'agency_id' => 2],
            ['registration_number' => 'ML-9012-EF', 'model' => 'Mercedes Sprinter', 'capacity' => 20, 'status' => 'maintenance', 'agency_id' => 3],
        ];
        DB::table('buses')->insert($buses);

        // ----------------------
        // 4. Routes
        // ----------------------
        $routes = [
            ['departure_city_id' => 1, 'arrival_city_id' => 2], // Bamako → Sikasso
            ['departure_city_id' => 2, 'arrival_city_id' => 3], // Sikasso → Segou
            ['departure_city_id' => 1, 'arrival_city_id' => 3], // Bamako → Segou
        ];
        DB::table('routes')->insert($routes);

        // ----------------------
        // 5. Trips
        // ----------------------
        $trips = [
            [
                'route_id' => 1,
                'bus_id' => 1,
                'departure_at' => Carbon::now()->addHours(3),
                'arrival_at' => Carbon::now()->addHours(8),
                'base_price' => 5000,
                'seats_available' => 30,
            ],
            [
                'route_id' => 2,
                'bus_id' => 2,
                'departure_at' => Carbon::now()->addHours(5),
                'arrival_at' => Carbon::now()->addHours(10),
                'base_price' => 4000,
                'seats_available' => 40,
            ],
            [
                'route_id' => 3,
                'bus_id' => 3,
                'departure_at' => Carbon::now()->addHours(2),
                'arrival_at' => Carbon::now()->addHours(7),
                'base_price' => 6000,
                'seats_available' => 20,
            ],
        ];
        DB::table('trips')->insert($trips);

        // ----------------------
        // 6. Admin User
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
        // 7. Tickets Seeder
        // ----------------------
        $this->call([
            TicketsTableSeeder::class,
        ]);
    }
}
