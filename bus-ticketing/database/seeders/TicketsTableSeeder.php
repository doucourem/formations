<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Ticket;
use App\Models\Trip;
use App\Models\User;

class TicketsTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $admin = User::where('role', 'admin')->first(); // Utilisateur admin existant
        $trips = Trip::all(); // Tous les trips existants

        foreach ($trips as $trip) {
            // Générer quelques tickets par trip
            for ($i = 0; $i < 3; $i++) {
                Ticket::create([
                    'trip_id' => $trip->id,
                    'user_id' => $admin->id,
                    'client_name' => 'Client ' . fake()->name(),
                    'client_nina' => fake()->numerify('#########'),
                    'client_phone' => fake()->phoneNumber(),
                    'client_email' => fake()->unique()->safeEmail(),
                    'seat_number' => strtoupper(fake()->randomLetter()) . rand(1, $trip->seats_available),
                    'price' => $trip->base_price,
                    'status' => fake()->randomElement(['reserved', 'paid', 'canceled']),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
